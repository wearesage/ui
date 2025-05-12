import { ref, computed, watch } from 'vue'
import * as toolServerService from '../services/toolServerService'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  id?: string
  toolCalls?: ToolCall[]
  toolCallId?: string
  name?: string
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface Tool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters?: Record<string, any>
  }
}

export interface ToolResult {
  toolCallId: string
  content: string
}

export interface DualModelOptions {
  baseUrl?: string
  conversationModel?: string
  toolModel?: string
  tools?: Tool[]
  persistChat?: boolean
  storageKey?: string
  num_ctx?: number;
}

export function useOllama(options: DualModelOptions = {}) {
  const baseUrl = options.baseUrl || 'http://localhost:11434'
  const conversationModel = options.conversationModel || 'gemma3:4b'
  const toolModel = options.toolModel // No default value, will be undefined if not provided
  const tools = options.tools || []
  // Keep models in memory for 30 minutes by default
  const keepAlive = '30m'
  // Chat persistence options
  const persistChat = options.persistChat ?? false
  const storageKey = options.storageKey || 'dualModelChat'
  
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const abortController = ref<AbortController | null>(null)
  const toolResults = ref<ToolResult[]>([])
  const pendingToolCalls = ref<ToolCall[]>([])
  
  // Load messages from localStorage if persistence is enabled
  const loadFromStorage = () => {
    if (persistChat && typeof localStorage !== 'undefined') {
      try {
        const savedChat = localStorage.getItem(storageKey)
        if (savedChat) {
          messages.value = JSON.parse(savedChat)
          console.log('Chat loaded from localStorage')
        }
      } catch (err) {
        console.error('Error loading chat from localStorage:', err)
      }
    }
  }
  
  // Save messages to localStorage if persistence is enabled
  const saveToStorage = () => {
    if (persistChat && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages.value.map(v => ({ role: v.role, content: v.content }))))
      } catch (err) {
        console.error('Error saving chat to localStorage:', err)
      }
    }
  }
  
  // Watch for changes to messages and save to localStorage
  if (persistChat && typeof window !== 'undefined') {
    watch(messages, () => {
      saveToStorage()
    }, { deep: true })
  }
  
  // Initial load from localStorage
  if (typeof window !== 'undefined') {
    loadFromStorage()
  }
  
  // Initialize the chat with system message if provided
  const initChat = (systemMessage?: string, loadSaved: boolean = true) => {
    messages.value = []
    toolResults.value = []
    pendingToolCalls.value = []
    
    // If loadSaved is true and persistence is enabled, try to load from localStorage
    if (loadSaved && persistChat) {
      loadFromStorage()
    }
    
    // If we have a system message and either there are no messages or we're not loading saved messages
    if (systemMessage && (messages.value.length === 0 || !loadSaved)) {
      // Clear any existing messages if we're not loading saved ones
      if (!loadSaved) {
        messages.value = []
      }
      
      // Add the system message if it doesn't already exist
      const hasSystemMessage = messages.value.some(m => m.role === 'system')
      if (!hasSystemMessage) {
        messages.value.unshift({
          role: 'system',
          content: systemMessage
        })
      }
      
      // Save to storage if persistence is enabled
      saveToStorage()
    }
  }
  
  // Check if a message likely needs tool calls
  const checkForToolCalls = async (content: string): Promise<boolean> => {
    // First, try a more sophisticated detection by making a quick call to the tool model
    // with a system prompt that asks it to determine if tools are needed
    try {
      const toolDetectionMessages = [
        {
          role: 'system',
          content: `You are a tool detection assistant. Your job is to determine if a user message requires the use of tools.
Available tools:
1. get_graph_schema - Get the schema of our neo4j graph
2. cypher_query - Run a native cypher query against our neo4j graph
3. get_weather - Get current weather information for a location
4. search_web - Search the web for information
5. calculate - Perform a mathematical calculation
6. get_date_time - Get current date and time information

For each tool, here are examples of when to use it:
- get_graph_schema: "What's in our database?", "Show me the schema", "What node types exist?"
- cypher_query: "Find all connections between X and Y", "Count nodes with property Z"
- get_weather: "What's the weather in New York?", "Will it rain tomorrow?", "Temperature in Tokyo"
- search_web: "Who won the World Cup?", "Information about quantum computing"
- calculate: "What is 145 * 32?", "Calculate square root of 169", "15% of 200"
- get_date_time: "What time is it?", "What's today's date?", "Time in Tokyo"

Respond with "YES" if the message likely requires one of these tools, or "NO" if it doesn't.
If YES, also specify which tool would be most appropriate.`
        },
        { role: 'user', content }
      ]
      
      // Make a non-streaming call to the tool model for detection
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: toolModel,
          messages: toolDetectionMessages,
          stream: false,
          keep_alive: keepAlive // Keep model in memory
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const detectionResult = data.message?.content || ''
        
        // If the model clearly indicates tools are needed
        if (detectionResult.toUpperCase().includes('YES')) {
          // Log which tool was suggested if mentioned
          const toolMatches = {
            'get_graph_schema': ['graph schema', 'database schema', 'schema'],
            'cypher_query': ['cypher', 'query', 'database query'],
            'get_weather': ['weather', 'temperature', 'forecast'],
            'search_web': ['search', 'look up', 'find information'],
            'calculate': ['calculate', 'computation', 'math'],
            'get_date_time': ['date', 'time', 'current time']
          };
          
          let suggestedTool = '';
          for (const [tool, keywords] of Object.entries(toolMatches)) {
            if (keywords.some(keyword => detectionResult.toLowerCase().includes(keyword))) {
              suggestedTool = tool;
              break;
            }
          }
          
          if (suggestedTool) {
            console.log(`Tool detection model suggests using ${suggestedTool}`)
          } else {
            console.log('Tool detection model suggests tools are needed')
          }
          
          return true
        }
        
        // If the model clearly indicates tools are not needed
        if (detectionResult.toUpperCase().includes('NO') && !detectionResult.toUpperCase().includes('YES')) {
          console.log('Tool detection model suggests tools are not needed')
          return false
        }
      }
    } catch (err) {
      console.error('Error in sophisticated tool detection:', err)
      // Fall back to keyword-based detection if the API call fails
    }
    
    // Fallback: Keyword-based detection with comprehensive patterns
    console.log('Using fallback keyword-based tool detection')
    
    const contentLower = content.toLowerCase()
    
    // Tool-specific patterns
    const graphPatterns = ['graph', 'database', 'query', 'schema', 'cypher', 'neo4j', 'node', 'relationship']
    const weatherPatterns = ['weather', 'temperature', 'forecast', 'humidity', 'rain', 'snow', 'sunny', 'cloudy', 'climate']
    const searchPatterns = ['search', 'find information', 'look up', 'google', 'research', 'information about']
    const calculationPatterns = ['calculate', 'compute', 'math', 'equation', 'formula', 'solve', 'plus', 'minus', 'times', 'divided by', '+', '-', '*', '/', '=']
    const dateTimePatterns = ['date', 'time', 'today', 'current time', 'current date', 'timezone', 'day', 'month', 'year', 'hour', 'minute']
    
    // Question patterns that often indicate tool use
    const questionPatterns = [
      'what is', 'how is', 'can you tell me', 'show me', 'find', 'get', 'calculate',
      'what\'s the', 'how many', 'when is', 'where is', 'who is'
    ]
    
    // Check for tool-specific patterns
    const hasGraphPattern = graphPatterns.some(pattern => contentLower.includes(pattern))
    const hasWeatherPattern = weatherPatterns.some(pattern => contentLower.includes(pattern))
    const hasSearchPattern = searchPatterns.some(pattern => contentLower.includes(pattern))
    const hasCalculationPattern = calculationPatterns.some(pattern => contentLower.includes(pattern))
    const hasDateTimePattern = dateTimePatterns.some(pattern => contentLower.includes(pattern))
    
    // Check for question patterns that might indicate tool use
    const hasQuestionPattern = questionPatterns.some(pattern => contentLower.includes(pattern))
    
    // Check for numerical expressions that might indicate calculation needs
    const hasNumericalExpression = /\d+\s*[\+\-\*\/]\s*\d+/.test(contentLower)
    
    // Return true if any tool-specific pattern is found
    if (hasGraphPattern || hasWeatherPattern || hasSearchPattern ||
        hasCalculationPattern || hasDateTimePattern || hasNumericalExpression) {
      return true
    }
    
    // If it has a question pattern but no specific tool pattern,
    // it might still need a tool (especially search)
    if (hasQuestionPattern) {
      return true
    }
    
    return false
  }
  
  // Get tool calls from the tool model
  const getToolCalls = async (content: string): Promise<{ toolCalls: ToolCall[] }> => {
    try {
      // Create a detailed system prompt that provides guidance on when to use each tool
      const toolSystemPrompt = `You are a helpful assistant that uses tools to answer questions.
Always use tools when appropriate. Do not explain what you are doing, just use the tools directly.

Available tools and when to use them:

1. get_graph_schema
   - Use when: The user asks about the structure, schema, or organization of the graph database
   - Example queries: "What's in our graph database?", "Show me the database schema", "What node types exist?"

2. cypher_query
   - Use when: The user wants specific information from the graph database that requires a custom query
   - Example queries: "Find all connections between X and Y", "Count how many nodes have property Z"
   - Parameters: { "query": "MATCH (n) RETURN n LIMIT 10" }

3. get_weather
   - Use when: The user asks about weather conditions for a location
   - Example queries: "What's the weather in New York?", "Will it rain tomorrow in London?", "Temperature in Tokyo"
   - Parameters: { "location": "city name or zip code" }

4. search_web
   - Use when: The user asks for general information that would require internet search
   - Example queries: "Who won the World Cup?", "Information about quantum computing", "Latest news about AI"
   - Parameters: { "query": "search terms" }

5. calculate
   - Use when: The user wants to perform a mathematical calculation
   - Example queries: "What is 145 * 32?", "Calculate the square root of 169", "What's 15% of 200?"
   - Parameters: { "expression": "mathematical expression" }

6. get_date_time
   - Use when: The user asks about current date, time, or timezone information
   - Example queries: "What time is it?", "What's today's date?", "What time is it in Tokyo?"
   - Parameters: { "timezone": "optional timezone name" }

Choose the most appropriate tool based on the user's query. If multiple tools could be useful, prioritize the most specific one.
If no tool is appropriate for the query, don't use any tools.`

      // Prepare messages with the enhanced system prompt
      // Only include our tool system prompt to avoid duplication
      const toolMessages = [
        {
          role: 'system',
          content: toolSystemPrompt
        },
        // Include recent conversation context but exclude system messages
        ...messages.value.slice(-5).filter(m => m.role !== 'system'), // Last few messages for context
        { role: 'user', content }
      ]
      
      // Make a non-streaming call to the tool model
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: toolModel,
          messages: toolMessages,
          tools,
          stream: false,
          keep_alive: keepAlive // Keep model in memory
        })
      })
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }
      
      const data = await response.json()
      return { 
        toolCalls: data.message?.tool_calls || [] 
      }
    } catch (err) {
      console.error('Error getting tool calls:', err)
      return { toolCalls: [] }
    }
  }
  
  // Execute the tools
  const executeTools = async (toolCalls: ToolCall[]): Promise<ToolResult[]> => {
    const results: ToolResult[] = []
    pendingToolCalls.value = [...toolCalls]
    
    for (const toolCall of toolCalls) {
      try {
        let result: any
        let args: any = {}
        
        // Safely parse the arguments with proper error handling
        try {
          if (toolCall.function.arguments) {
            // Make sure we're parsing a string, not an object
            const argsStr = typeof toolCall.function.arguments === 'string'
              ? toolCall.function.arguments
              : JSON.stringify(toolCall.function.arguments);
            
            args = JSON.parse(argsStr);
          }
        } catch (parseError) {
          console.error(`Error parsing tool arguments: ${parseError}`);
          result = { error: `Failed to parse tool arguments: ${parseError}` };
          results.push({
            toolCallId: toolCall.id,
            content: JSON.stringify(result, null, 2)
          });
          continue; // Skip to the next tool call
        }
        
        // Execute the appropriate tool based on the name using the tool server service
        try {
          // Use the executeTool function from toolServerService
          result = await toolServerService.executeTool(toolCall.function.name, args);
        } catch (toolError) {
          console.error(`Error executing tool ${toolCall.function.name}:`, toolError);
          result = { error: `Error executing tool: ${toolError}` };
        }
        
        results.push({
          toolCallId: toolCall.id,
          content: JSON.stringify(result, null, 2)
        });
      } catch (err) {
        console.error(`Error executing tool ${toolCall.function.name}:`, err);
        results.push({
          toolCallId: toolCall.id,
          content: JSON.stringify({ error: `Error executing tool: ${err}` })
        });
      }
    }
    
    toolResults.value = [...results]
    pendingToolCalls.value = []
    return results
  }
  
  // Stream a response from the conversation model
  const streamConversationModelResponse = async (
    userContent: string,
    images: string[] = [],
    toolResults: ToolResult[],
    onUpdate?: (text: string) => void
  ) => {
    try {
      // Prepare the empty assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: ''
      }
      
      // Add the assistant message to our thread
      messages.value.push(assistantMessage)
      
      // Prepare context that includes tool results
      let contextWithToolResults = ''
      if (toolResults.length > 0) {
        contextWithToolResults = 'I retrieved the following information to help answer your question:\n\n'
        
        for (const result of toolResults) {
          try {
            // Try to parse the content as JSON to make it more readable
            const parsedContent = JSON.parse(result.content);
            // Format the parsed content nicely
            contextWithToolResults += `${JSON.stringify(parsedContent, null, 2)}\n\n`;
          } catch (e) {
            // If it's not valid JSON, use the original content
            contextWithToolResults += `${result.content}\n\n`;
          }
        }
        
        contextWithToolResults += 'Based on this information, here is my response:\n\n'
      }
      
      // Get the last user message from our messages array
      // This prevents duplicating the user message in the API call
      const lastUserMessageIndex = messages.value
        .slice(0, -1) // Exclude the empty assistant message we just added
        .map((m, i) => ({ message: m, index: i }))
        .filter(item => item.message.role === 'user')
        .pop()?.index;
      
      // Prepare messages for the conversation model
      // Include only the first system message to avoid duplication
      const systemMessages = messages.value.filter(m => m.role === 'system');
      const conversationMessages = systemMessages.length > 0
        ? [systemMessages[0]] // Only include the first system message
        : [];
      
      // Add recent conversation context
      // Get messages between the last 5 messages and the empty assistant message
      if (lastUserMessageIndex !== undefined) {
        // Include up to 5 messages before the last user message for context
        const startIndex = Math.max(0, lastUserMessageIndex - 5);
        conversationMessages.push(
          ...messages.value.slice(startIndex, -1) // Exclude the empty assistant message
        );
      } else {
        // Fallback if we couldn't find the last user message
        conversationMessages.push(
          ...messages.value.slice(-6, -1) // Last few messages for context, excluding the empty assistant message
        );
      }
      
      // If we have tool results, add them as context to the last user message
      // instead of duplicating the user message
      if (toolResults.length > 0 && lastUserMessageIndex !== undefined) {
        // Modify the last user message to include tool results
        const lastUserMessage = { ...conversationMessages[conversationMessages.length - 1] };
        if (lastUserMessage.role === 'user') {
          // Don't modify the user's original message, instead add a system message with context
          conversationMessages.push({
            role: 'system',
            content: `Context for answering the user's question:\n${contextWithToolResults}`
          });
        } else {
          // If the last message isn't a user message (unlikely), add a new one
          conversationMessages.push({
            role: 'user',
            content: userContent
          });
          
          // Then add the context as a system message
          conversationMessages.push({
            role: 'system',
            content: `Context for answering the user's question:\n${contextWithToolResults}`
          });
        }
      }
      
      abortController.value = new AbortController()

      ;(conversationMessages[conversationMessages.length - 1] as any).images = (images || []).map(v => v?.replace?.('data:image/png;base64,', '') && v?.replace?.('data:image/jpeg;base64,', ''))
      
      // Make a streaming call to the conversation model
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: conversationModel,
          messages: conversationMessages,
          stream: true,
          keep_alive: keepAlive,
          num_ctx: options.num_ctx || Math.pow(2, 12)
        }),
        signal: abortController.value.signal
      })
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }
      
      // Process the streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body is null')
      
      let responseText = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        // Parse the chunk
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter(Boolean)
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            
            // Process content
            if (data.message?.content) {
              assistantMessage.content += data.message.content
              responseText += data.message.content
              
              // Update the last message in our thread
              const lastIndex = messages.value.length - 1
              messages.value[lastIndex] = { ...assistantMessage }
              
              if (onUpdate) onUpdate(responseText)
            }
            
            // Handle done message
            if (data.done) {
              break
            }
          } catch (e) {
            console.error('Error parsing streaming response:', e)
          }
        }
      }
      
      return assistantMessage
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        error.value = err as Error
      }
      // Remove the last message (assistant) if there was an error
      if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'assistant') {
        messages.value.pop()
      }
      throw err
    } finally {
      abortController.value = null
    }
  }
  
  // Stream a message with potential tool calling
  const streamMessage = async ({ message, images }: { message: string, images: any[] }, onUpdate?: (text: string) => void) => {
    try {
      if (isLoading.value) return
      
      isLoading.value = true
      error.value = null
      
      // Clear any existing messages with the same content to prevent duplication
      const lastMessages = messages.value.slice(-3); // Look at the last few messages
      const duplicateIndices = [];
      
      // Find any duplicate user messages with the same content
      for (let i = lastMessages.length - 1; i >= 0; i--) {
        const messageIndex = messages.value.length - (lastMessages.length - i);
        if (lastMessages[i].role === 'user' && lastMessages[i].content === message) {
          duplicateIndices.push(messageIndex);
        }
      }
      
      // Remove all but the first duplicate (if any)
      if (duplicateIndices.length > 1) {
        // Keep the first occurrence, remove the rest
        duplicateIndices.shift();
        // Remove duplicates from the end to avoid index shifting issues
        for (let i = duplicateIndices.length - 1; i >= 0; i--) {
          messages.value.splice(duplicateIndices[i], 1);
        }
      }
      
      // Add user message to the thread if it's not already the last user message
      const lastUserMessage = [...messages.value].reverse().find(m => m.role === 'user');
      if (!lastUserMessage || lastUserMessage.content !== message) {
        const userMessage: Message = { role: 'user', content: message };
        messages.value.push(userMessage);
      }
      
      // Skip tool calling entirely if no toolModel is provided
      if (!toolModel) {
        return await streamConversationModelResponse(message, images, [], onUpdate)
      }
      
      // Only proceed with tool calling if a toolModel is provided
      // First, check if we need to call tools
      const needsToolCalls = await checkForToolCalls(message)
      
      if (needsToolCalls) {
        console.log('Message likely needs tool calls, using tool model')
        
        // Use tool model to get tool calls
        const { toolCalls } = await getToolCalls(message)
        
        if (toolCalls.length > 0) {
          console.log('Got tool calls:', toolCalls)
          
          // Execute the tools
          const results = await executeTools(toolCalls)
          
          // Now use the conversation model with the tool results as context
          return await streamConversationModelResponse(message, images, results, onUpdate)
        } else {
          console.log('No tool calls returned, falling back to conversation model')
          // Fall back to conversation model if no tool calls were returned
          return await streamConversationModelResponse(message, images,[], onUpdate)
        }
      } else {
        console.log('Message does not need tool calls, using conversation model directly')
        // Directly use the conversation model
        return await streamConversationModelResponse(message, images, [], onUpdate)
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err
        console.error('Error in streamMessage:', err)
      }
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // Cancel any ongoing requests
  const cancelRequest = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      isLoading.value = false
    }
  }
  
  // Clear the conversation history
  const clearChat = () => {
    messages.value = []
    toolResults.value = []
    pendingToolCalls.value = []
    error.value = null
    
    // Clear from localStorage if persistence is enabled
    if (persistChat && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
        console.log('Chat cleared from localStorage')
      } catch (err) {
        console.error('Error clearing chat from localStorage:', err)
      }
    }
  }
  
  return {
    messages,
    isLoading,
    error,
    pendingToolCalls: computed(() => pendingToolCalls.value),
    toolResults: computed(() => toolResults.value),
    
    initChat,
    streamMessage,
    cancelRequest,
    clearChat
  }
}