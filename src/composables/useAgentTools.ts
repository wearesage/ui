import { ref } from 'vue';

const BASE_URL = import.meta.env.VITE_WEB3 + '/api/agent'
export interface ToolExecutionResponse {
  toolName: string;
  result: any;
  error?: string;
}

export function useAgentTools() {
  const toolsMetadata = ref<{ name: string; description: string }[]>([]);
  const isExecuting = ref(false);
  const executionError = ref<Error | null>(null);

  /**
   * Fetch available tools metadata
   */
  async function fetchToolsMetadata() {
    try {
      const data = await fetch(BASE_URL + '/tools-metadata').then(v => v.json());
      toolsMetadata.value = data;
    } catch (error) {
      console.error('Failed to fetch tools metadata:', error);
    }
  }

  /**
   * Get session data from localStorage
   */
  function getSessionData() {
    const stored = localStorage.getItem('siwe-session');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse session data:', error);
      return null;
    }
  }

  /**
   * Execute a tool with on-chain verification
   * @param name Tool name
   * @param args Tool arguments
   * @returns Tool execution result
   */
  async function executeTool(
    name: string,
    parameters: Record<string, any>
  ): Promise<ToolExecutionResponse> {
    isExecuting.value = true;
    executionError.value = null;

    try {
      // Get session data for authorization
      const sessionData = getSessionData();
      
      // Prepare headers with authorization if session exists
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (sessionData) {
        // Use session data as Bearer token
        headers['Authorization'] = `Bearer ${btoa(JSON.stringify(sessionData))}`;
      }


      // Execute the tool
      console.log(`Executing tool: ${name}`, parameters);
      
      const response = await fetch(`${BASE_URL}/execute-tool`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          toolName: name,
          parameters: parameters || {}
        })
      });

      return {
        toolName: name,
        result: await response.json(),
        error: null
      }
    } catch (error: any) {
      return {
        toolName: name,
        result: null,
        error
      }
    } finally {
      isExecuting.value = false;
    }
  }

  // Fetch tools metadata on initialization
  fetchToolsMetadata();

  return {
    toolsMetadata,
    isExecuting,
    executionError,
    fetchToolsMetadata,
    executeTool
  };
}