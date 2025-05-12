# SOMA Developer Quick Reference

This document provides a quick reference for developers who want to integrate with or extend the SOMA platform, with a focus on the Reown AppKit and OpenRouter integration.

## Reown AppKit Integration

### Installation

```bash
npm install @reown/appkit @reown/appkit-vue @reown/appkit-adapter-ethers5 @reown/appkit-siwe
```

### Basic Setup

```typescript
import { createAppKit, useAppKit, useAppKitAccount } from "@reown/appkit/vue";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import { createSIWEConfig, formatMessage } from "@reown/appkit-siwe";

// Create SIWE config
const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: window.location.host,
    uri: window.location.origin,
    chains: [mainnet.id, arbitrum.id],
    statement: "Sign in to the application.",
    // Optional resources for tool authorization
    resources: tools.map(tool => `urn:tool:${tool.name}:${tool.description}`),
  }),
  // Other config options...
});

// Initialize AppKit
createAppKit({
  adapters: [new Ethers5Adapter()],
  projectId: "your-reown-project-id",
  networks: [mainnet, arbitrum],
  siweConfig,
});

// Access AppKit in components
const { open, close } = useAppKit();
const account = useAppKitAccount();
```

### Usage in Components

```typescript
// Open wallet connection dialog
function connectWallet() {
  open();
}

// Check if user is authenticated
const isAuthenticated = computed(() => !!account.value?.address);

// Get user's wallet address
const walletAddress = computed(() => account.value?.address);

// Disconnect wallet
function disconnectWallet() {
  close();
}
```

### Custom Message Format

```typescript
function createCustomMessage({ address, ...args }) {
  const baseMessage = formatMessage(args, address);
  const customSection = `
  
Additional information:
- Custom data can be added here
- Multiple lines are supported
`;
  return baseMessage + customSection;
}
```

## OpenRouter Integration

### Installation

```bash
npm install openrouter
```

### Basic Setup

```typescript
// Create a composable for OpenRouter
export function useOpenRouter(options = {}) {
  const {
    apiKey = import.meta.env.VITE_OPENROUTER_API_KEY,
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel = 'google/gemma-3-27b-it',
    defaultParams = {},
  } = options;
  
  const loading = ref(false);
  const error = ref(null);
  const response = ref(null);
  const streamingContent = ref('');
  const isStreaming = ref(false);
  
  // Implementation details...
  
  return {
    loading,
    error,
    response,
    streamingContent,
    isStreaming,
    sendMessage,
    cancelRequest,
    reset,
  };
}
```

### Sending Messages

```typescript
const { sendMessage, streamingContent, isStreaming } = useOpenRouter();

// Define messages
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello, how are you?' }
];

// Send a message with streaming
await sendMessage(messages, { stream: true });

// Send a message without streaming
const response = await sendMessage(messages, { stream: false });
```

### Handling Streaming

```vue
<template>
  <div>
    <div v-if="isStreaming">
      <p>{{ streamingContent }}</p>
    </div>
    <button @click="cancelRequest" v-if="isStreaming">Cancel</button>
  </div>
</template>

<script setup>
const { streamingContent, isStreaming, sendMessage, cancelRequest } = useOpenRouter();

// Watch for streaming content changes
watch(() => streamingContent.value, (newContent) => {
  // Do something with the new content
  console.log('New content:', newContent);
});
</script>
```

### Tool Execution

```typescript
// Define tools
const tools = [
  {
    name: 'search_web',
    description: 'Search the web for information',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query',
        },
      },
      required: ['query'],
    },
  },
];

// Send a message with tools
await sendMessage(messages, {
  tools,
  tool_choice: 'auto',
});

// Execute a tool
async function executeTool(toolName, params) {
  // Implementation details...
  return { result: 'Tool execution result' };
}

// Handle tool calls
async function handleToolCalls(toolCalls) {
  for (const toolCall of toolCalls) {
    const { name, parameters } = toolCall;
    const result = await executeTool(name, parameters);
    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      name,
      content: JSON.stringify(result),
    });
  }
  
  // Continue the conversation
  await sendMessage(messages);
}
```

## Integration Examples

### Wallet Authentication with Tool Authorization

```typescript
// In your authentication store
export const useAuth = defineStore('auth', () => {
  // Set up SIWE config with tool authorization
  const siweConfig = createSIWEConfig({
    getMessageParams: async () => ({
      domain: window.location.host,
      uri: window.location.origin,
      chains: [mainnet.id, arbitrum.id],
      statement: "Sign in and authorize agent tools.",
      resources: toolsMetadata.value.map(
        (tool) => `urn:goat:tool:${tool.name}:${encodeURIComponent(tool.description)}`
      ),
    }),
    // Other config options...
  });
  
  // Initialize AppKit
  createAppKit({
    adapters: [new Ethers5Adapter()],
    projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
    networks: [mainnet, arbitrum],
    siweConfig,
  });
  
  // Expose AppKit methods
  const { open, close } = useAppKit();
  const account = useAppKitAccount();
  
  return {
    open,
    close,
    account,
    // Other methods...
  };
});
```

### AI Chat Component with OpenRouter

```vue
<template>
  <div class="chat">
    <div class="messages">
      <div v-for="(message, index) in messages" :key="index" :class="message.role">
        <div v-if="message.role === 'assistant'">
          <vue-markdown :source="message.content" />
        </div>
        <div v-else>
          {{ message.content }}
        </div>
      </div>
    </div>
    
    <div class="input-area">
      <textarea v-model="userInput" @keydown.enter.prevent="sendMessage" />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VueMarkdown from 'vue-markdown-render';
import { useOpenRouter } from '../composables/useOpenRouter';

const props = defineProps({
  systemPrompt: {
    type: String,
    default: 'You are a helpful assistant.'
  },
  model: {
    type: String,
    default: 'google/gemma-3-27b-it'
  }
});

const messages = ref([
  { role: 'system', content: props.systemPrompt }
]);

const userInput = ref('');

const {
  loading,
  streamingContent,
  isStreaming,
  sendMessage: sendToOpenRouter,
  cancelRequest
} = useOpenRouter({ defaultModel: props.model });

// Watch streaming content and update the last assistant message
watch(() => streamingContent.value, (newContent) => {
  if (messages.value[messages.value.length - 1].role === 'assistant') {
    messages.value[messages.value.length - 1].content = newContent;
  }
});

async function sendMessage() {
  if (!userInput.value.trim()) return;
  
  // Add user message
  messages.value.push({
    role: 'user',
    content: userInput.value
  });
  
  // Clear input
  userInput.value = '';
  
  // Send to OpenRouter with streaming
  await sendToOpenRouter(messages.value, { stream: true });
  
  // Add empty assistant message for streaming
  messages.value.push({
    role: 'assistant',
    content: ''
  });
}
</script>
```

## Common Patterns

### Session Management

```typescript
// Store session after authentication
function storeSession(session) {
  localStorage.setItem('session', JSON.stringify(session));
}

// Load session on app initialization
function loadSession() {
  const stored = localStorage.getItem('session');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Clear session on logout
function clearSession() {
  localStorage.removeItem('session');
}
```

### Tool Authorization Flow

```typescript
// 1. Define available tools
const availableTools = [
  {
    name: 'search_web',
    description: 'Search the web for information',
    // Tool parameters...
  },
  // Other tools...
];

// 2. Include tools in SIWE message
const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    // Other params...
    resources: availableTools.map(
      (tool) => `urn:tool:${tool.name}:${encodeURIComponent(tool.description)}`
    ),
  }),
  // Other config...
});

// 3. After authentication, store authorized tools in session
verifyMessage: async ({ message, signature }) => {
  try {
    const response = await fetch("/api/auth/verify-siwe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });

    if (response.ok) {
      const session = await response.json();
      // Extract authorized tools from message
      session.authorizedTools = extractToolsFromMessage(message);
      localStorage.setItem("session", JSON.stringify(session));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// 4. When using OpenRouter, include authorized tools
function sendMessageWithTools(messages) {
  const session = loadSession();
  const authorizedTools = session?.authorizedTools || [];
  
  // Add tools information to system message
  const systemMessage = messages.find(m => m.role === 'system');
  if (systemMessage) {
    systemMessage.content += `
    
You have access to the following tools:
${JSON.stringify(authorizedTools, null, 2)}

You can call them like this:
\`\`\`yaml
name: tool_name
parameters:
  param1: value1
  param2: value2
\`\`\`
`;
  }
  
  return sendToOpenRouter(messages, { stream: true });
}
```

## Best Practices

### Security

1. **Never expose API keys in client-side code**
   - Use environment variables and server-side proxies

2. **Validate all user input**
   - Sanitize inputs before processing
   - Use type checking and validation libraries

3. **Implement proper error handling**
   - Catch and log errors
   - Provide user-friendly error messages

### Performance

1. **Optimize AI requests**
   - Use streaming for better user experience
   - Limit context size to reduce token usage
   - Implement caching for common queries

2. **Manage resources efficiently**
   - Clean up event listeners and subscriptions
   - Cancel pending requests when components unmount

3. **Implement lazy loading**
   - Load components and resources only when needed
   - Use code splitting to reduce initial bundle size

### User Experience

1. **Provide clear feedback**
   - Show loading states during operations
   - Indicate when AI is generating a response
   - Display error messages in a user-friendly way

2. **Implement responsive design**
   - Ensure the UI works well on different devices
   - Adapt the chat interface for mobile screens

3. **Maintain accessibility**
   - Use semantic HTML
   - Ensure keyboard navigation works
   - Add appropriate ARIA attributes

## Troubleshooting

### Wallet Connection Issues

- Check if the wallet is installed and unlocked
- Verify the network configuration matches the user's wallet
- Ensure the correct adapter is being used

### OpenRouter API Issues

- Verify the API key is valid and has sufficient credits
- Check for rate limiting or quota issues
- Ensure the model being requested is available

### Tool Execution Problems

- Verify the tool is properly authorized in the SIWE message
- Check that the tool implementation is working correctly
- Ensure the tool parameters are correctly formatted

## Resources

- [Reown AppKit Documentation](https://docs.reown.xyz/appkit)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [SIWE Specification](https://eips.ethereum.org/EIPS/eip-4361)
- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [Pinia Documentation](https://pinia.vuejs.org/)