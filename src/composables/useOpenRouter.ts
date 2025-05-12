import { ref, computed, shallowRef, watch } from 'vue';
import type {
  ChatMessage,
  OpenRouterOptions,
  OpenRouterRequestParams,
  OpenRouterResponse
} from './useOpenRouterTypes.ts';
import { handleStreamResponse, streamingContent } from './useOpenRouterStream';
import { executeToolsAndContinue } from './useToolExecutor';

/**
 * Vue composable for interacting with OpenRouter chat completions.
 */
export function useOpenRouter(options: OpenRouterOptions) {
  const {
    apiKey = import.meta.env.VITE_OPENROUTER_API_KEY,
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel = 'google/gemma-3-27b-it',
    defaultParams = {},
    http = {}
  } = options || {};


  const sessionData = ref<any>(null);
  
  function loadSessionData() {
    const stored = localStorage.getItem("siwe-session");
    if (stored) {
      try {
        sessionData.value = JSON.parse(stored);
        console.log('Loaded session data:', sessionData.value);
      } catch (e) {
        console.error('Failed to parse session data:', e);
      }
    }
  }
  
  // Load session data initially
  loadSessionData();
  
  // Watch for changes to session data
  watch(() => localStorage.getItem("siwe-session"), () => {
    loadSessionData();
  });
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const response = shallowRef<OpenRouterResponse | null>(null);
  // Use the imported streamingContent ref instead of creating a new one
  const isStreaming = ref(false);
  const abortController = shallowRef<AbortController | null>(null);

  // Text of the first choice
  const responseText = computed(() => {
    const res = response.value;
    if (!res) return '';
    const choice = res.choices[0];
    return choice.message?.content || choice.text || '';
  });

  // Whether the response has tool calls
  const hasToolCalls = computed(() => {
    const res = response.value;
    if (!res) return false;
    const choice: any = res.choices[0];
    return !!choice.tool_calls || !!choice.message?.tool_calls;
  });

  // Extract tool calls array
  const toolCalls = computed(() => {
    const res = response.value;
    if (!res) return [];
    const choice: any = res.choices[0];
    return choice.tool_calls || choice.message?.tool_calls || [];
  });

  /**
   * Send a chat completion request to OpenRouter.
   */
  async function sendMessage(
    messages: ChatMessage[],
    params: Partial<OpenRouterRequestParams> = {}
  ): Promise<OpenRouterResponse> {
    loading.value = true;
    error.value = null;
    response.value = null;
    streamingContent.value = '';
    abortController.value = new AbortController();
    const merged: OpenRouterRequestParams = {
      model: (Array.isArray(defaultModel) ? null : defaultModel) as any,
      models: (Array.isArray(defaultModel) ? defaultModel : null) as any,
      messages: clone(messages),
      ...defaultParams,
      ...params,
      tool_choice: params.tool_choice ?? defaultParams.tool_choice ?? 'auto'
    };

    if (defaultModel.indexOf('gemma') !== -1) {
      delete merged.tools
      delete merged.tool_choice
      
      // Get authorized tools from session data
      const authorizedTools = sessionData.value?.tools || [];
      console.log('Authorized tools:', authorizedTools);
      merged.messages[0].content += `
      
p.p.p.s you have access to tools:

${JSON.stringify(authorizedTools, null, 2)}

you can call them like this:

\`\`\`yaml
name: get_balance 
\`\`\`

if you need or want to call a tool, please make sure it's at the very end of your response. last but not least, please avoid calling more than 1 at once.

try to get some context before firing off actions.
`
    }

    console.log(merged.messages[0].content)
    const streaming = merged.stream === true;
    isStreaming.value = true;

    let retries = 0;
    const maxRetries = http.retries ?? 0;
    const retryDelay = http.retryDelay ?? 1000;

    while (true) {
      try {
        // Prepare fetch with timeout and abort
        const controller = abortController.value!;
        const timeout = http.timeout;
        let timer: number | undefined;
        const timeoutPromise = timeout
          ? new Promise<never>((_, reject) => {
              timer = window.setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout);
            })
          : null;

        const fetchPromise = fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': document.title
          },
          body: JSON.stringify(merged),
          signal: controller.signal
        });

        const res = timeoutPromise
          ? await Promise.race([fetchPromise, timeoutPromise])
          : await fetchPromise;
        if (timer) clearTimeout(timer);

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const msg = errData?.error?.message || `Error ${res.status} ${res.statusText}`;
          throw new Error(msg);
        }

        if (streaming) {
          const full = await handleStreamResponse(res, messages, params);
          response.value = full;
          // After streaming completes, handle any tool calls
          if (hasToolCalls.value) {
            const next = await executeToolsAndContinue(messages, full, sendMessage);
            return next ?? full;
          }
          return full;
        } else {
          const data: OpenRouterResponse = await res.json();
          response.value = data;
          
          // Check if response has tool calls
          const hasTool = hasToolCalls.value;
          
          // Ensure assistant message is in the conversation for tool execution
          // If there are tool calls, don't include content to avoid duplication
          messages.push({
            role: 'assistant',
            content: hasTool ? '' : (data.choices[0].message?.content || data.choices[0].text || ''),
            tool_calls: hasTool ? (data.choices[0].tool_calls || data.choices[0].message?.tool_calls) : undefined
          });
          
          // Immediately execute tool calls if present
          if (hasTool) {
            const next = await executeToolsAndContinue(messages, data, sendMessage);
            return next ?? data;
          }
          return data;
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          error.value = new Error('Request cancelled');
          throw error.value;
        }
        if (retries < maxRetries) {
          retries++;
          await new Promise(r => setTimeout(r, retryDelay));
          continue;
        }
        error.value = e instanceof Error ? e : new Error(String(e));
        throw error.value;
      } finally {
        if (!streaming || error.value) {
          loading.value = false;
        }

        isStreaming.value = false;
      }
    }
  }

  /**
   * Cancel the current request.
   */
  function cancelRequest() {
    const ctrl = abortController.value;
    console.log(ctrl)
    if (ctrl) {
      ctrl.abort();
      abortController.value = null;
      loading.value = false;
      isStreaming.value = false;
    }
  }

  /**
   * Reset all state.
   */
  function reset() {
    cancelRequest();
    error.value = null;
    response.value = null;
    streamingContent.value = '';
  }

  return {
    loading,
    error,
    response,
    responseText,
    streamingContent,
    isStreaming,
    hasToolCalls,
    toolCalls,
    sendMessage,
    cancelRequest,
    reset,
    executeToolsAndContinue
  };
}