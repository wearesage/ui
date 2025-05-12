import type {
  ChatMessage,
  OpenRouterRequestParams,
  OpenRouterResponse,
  OpenRouterStreamChunk
} from './useOpenRouterTypes';
import { ref } from 'vue';

// Create a ref to store streaming content that can be imported by other components
export const streamingContent = ref('');

/**
 * Streaming handler for OpenRouter API.
 * Mutates the last assistant message in `messages` with incoming content chunks.
 */
export async function handleStreamResponse(
  res: Response,
  messages: ChatMessage[]
): Promise<OpenRouterResponse> {
  if (!res.body) {
    throw new Error('Response body is null');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  
  let buffer = '';
  let fullContent = '';
  let lastChunk: OpenRouterStreamChunk | null = null;
  let aggregatedToolCalls: any[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;
        let chunk: OpenRouterStreamChunk;
        try {
          chunk = JSON.parse(data);
        } catch {
          continue;
        }
        lastChunk = chunk;
        const delta = chunk.choices?.[0]?.delta;
        const content = delta?.content || '';
        fullContent += content;
        
        // Update the last message in the array
        if (messages.length > 0) {
          messages[messages.length - 1].content += content;
        }
        
        // Update the streamingContent ref for UI components to watch
        streamingContent.value = fullContent;
        
        // Aggregate tool calls from streaming chunks
        if (delta?.tool_calls) {
          for (const call of delta.tool_calls) {
            // Only aggregate tool calls with a non-empty id and a defined function name
            if (
              call &&
              typeof call === 'object' &&
              call.id &&
              typeof call.id === 'string' &&
              call.id.trim() !== '' &&
              call.function &&
              typeof call.function.name === 'string' &&
              call.function.name.trim() !== ''
            ) {
              aggregatedToolCalls.push(call);
            }
          }
        }

        // Mutate the last assistant message, but only if there are no tool calls
        // This prevents tool call errors from being duplicated in assistant messages
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && aggregatedToolCalls.length === 0) {
          lastMsg.content = fullContent;
        }
      }
    }
  } finally {
    reader.releaseLock?.();
  }

  // Construct final response
  const response: OpenRouterResponse = {
    id: lastChunk?.id || '',
    object: 'chat.completion',
    created: lastChunk?.created || Date.now(),
    model: lastChunk?.model || '',
    choices: [{
      message: {
        role: 'assistant',
        // If we have tool calls, don't include content to avoid duplication
        content: aggregatedToolCalls.length > 0 ? '' : fullContent,
        tool_calls: aggregatedToolCalls.length > 0 ? aggregatedToolCalls : undefined
      } as any,
      tool_calls: aggregatedToolCalls.length > 0 ? aggregatedToolCalls : undefined,
      index: 0,
      finish_reason: lastChunk?.choices?.[0]?.finish_reason || null
    }]
  };

  return response;
}
