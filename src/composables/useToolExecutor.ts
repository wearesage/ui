import type { ChatMessage, OpenRouterResponse } from './useOpenRouterTypes';
import { useAgentTools, type ToolExecutionResponse } from './useAgentTools';

/**
 * Execute an array of tool call definitions
 * @param toolCalls Array of tool call objects from an OpenRouter choice
 * @returns Array of ToolExecutionResponse
 */
export async function executeToolCalls(toolCalls: {
  id?: string;
  function: { name: string; arguments: string };
}[]): Promise<ToolExecutionResponse[]> {
  const { executeTool } = useAgentTools();
  const results: ToolExecutionResponse[] = [];

  for (const toolCall of toolCalls) {
    try {
      const name = toolCall.function.name;
      console.log(toolCall)
      const result = await executeTool(name, toolCall.function);
      results.push(result);
    } catch (e) {
      results.push({
        toolName: `${name}`,
        result: null,
        error: `Error parsing arguments: ${e instanceof Error ? e.message : String(e)}`
      });
    }
  }

  return results;
}

/**
 * Send tool execution results back to the LLM by constructing assistant and tool messages
 * @param toolResults Results from executeToolCalls
 * @param previousMessages Original chat messages to include
 * @param response The OpenRouterResponse containing the original tool_calls
 * @returns Promise resolving to a new OpenRouterResponse or null
 */
export async function sendToolResults(
  toolResults: ToolExecutionResponse[],
  previousMessages: ChatMessage[],
  response: OpenRouterResponse,
  sendMessage: (messages: ChatMessage[], { stream }: { stream: boolean}) => Promise<OpenRouterResponse>
): Promise<OpenRouterResponse | null> {
  if (toolResults.length === 0) return null;
  
  // Map original tool_calls from response
  const choice = response.choices[0];
  const originalCalls: any[] = choice.tool_calls || choice.message?.tool_calls || [];
  const responseToolCalls = originalCalls.map(call => ({
    id: call.id,
    name: call.function.name,
    parameters: call.function.arguments
  }));

  // Build assistant message with ONLY tool_calls, not content
  // This prevents error content duplication
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '', // Empty content instead of copying previous message content
    tool_calls: originalCalls
  };

  // Build tool messages with execution results
  const toolMessages: ChatMessage[] = toolResults.map((res, idx) => {
    if (res.error) {
      return {
        role: 'tool',
        content: JSON.stringify({ error: res.error }),
        name: res.toolName,
        tool_call_id: responseToolCalls[idx]?.id || ''
      };
    }
    return {
      role: 'tool',
      content: JSON.stringify(res.result),
      name: res.toolName,
      tool_call_id: responseToolCalls[idx]?.id || ''
    };
  });

  // Combine messages - remove the last message if it's an assistant message
  // to avoid duplication with our new assistant message
  let base = previousMessages;
  if (base.length > 0 && base[base.length - 1].role === 'assistant') {
    base = base.slice(0, -1);
  }
  
  const messages = [...base, assistantMessage, ...toolMessages];

  // Send back to LLM with streaming enabled
  return sendMessage(messages, { stream: true });
}

/**
 * Convenience: execute tools then send results
 * @param previousMessages Original chat messages
 * @param response Original OpenRouterResponse
 * @param sendMessage Callback to send messages back to OpenRouter
 */
export async function executeToolsAndContinue(
  previousMessages: ChatMessage[],
  response: OpenRouterResponse,
  sendMessage: (messages: ChatMessage[]) => Promise<OpenRouterResponse>
): Promise<OpenRouterResponse | null> {
  const choice = response.choices[0];
  const calls: any[] = choice.tool_calls || (choice.message as any)?.tool_calls || [];
  const results = await executeToolCalls(calls);
  return sendToolResults(results, previousMessages, response, sendMessage);
}