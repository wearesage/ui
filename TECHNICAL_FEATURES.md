# SOMA Technical Features Documentation

This document provides detailed technical information about two key features of the SOMA platform: the Reown AppKit integration and the AI-powered chat interface.

## Reown AppKit Integration

SOMA uses [Reown AppKit](https://docs.reown.xyz/appkit) for blockchain authentication and interaction. This integration enables secure wallet-based authentication and tool authorization.

### Implementation Details

The Reown AppKit integration is primarily implemented in the `auth.ts` store:

```typescript
import { createAppKit, useAppKit, useAppKitAccount } from "@reown/appkit/vue";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import { createSIWEConfig, formatMessage } from "@reown/appkit-siwe";
```

#### SIWE Configuration

The Sign-In with Ethereum (SIWE) configuration is set up to include tool authorization in the signed message:

```typescript
const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: window.location.host,
    uri: window.location.origin,
    chains: [mainnet.id, arbitrum.id],
    statement: "Sign in and authorize agent tools.",
    resources: toolsMetadata.value.map(
      (tool) =>
        `urn:goat:tool:${tool.name}:${encodeURIComponent(tool.description)}`
    ),
  }),
  createMessage: ({ address, ...args }) => {
    return createToolsMessage({ address, ...args });
  },
  // ... other configuration
});
```

#### Custom Message Format

A custom message format is used to include tool authorization information:

```typescript
function createToolsMessage({ address, ...args }: any) {
  const baseMessage = formatMessage(args, address);
  const toolsSection = `

Tools to authorize:
${toolsMetadata.value
  .map((tool) => `- ${tool.name}: ${tool.description}`)
  .join("\n")}`;

  return baseMessage + toolsSection;
}
```

#### AppKit Initialization

The AppKit is initialized with the SIWE configuration and network information:

```typescript
createAppKit({
  adapters: [new Ethers5Adapter()],
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  networks: [mainnet, arbitrum],
  siweConfig,
});
```

#### Session Management

After successful authentication, the session is stored in localStorage:

```typescript
verifyMessage: async ({ message, signature }) => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/verify-siwe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });

    if (response.ok) {
      const session = await response.json();
      localStorage.setItem("siwe-session", JSON.stringify(session));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
```

### Authentication Flow

1. User initiates authentication through the UI
2. AppKit opens a wallet connection dialog
3. User selects their wallet and connects
4. A SIWE message is generated, including tool authorizations
5. User signs the message with their wallet
6. Signature is verified by the server
7. Server creates a session and returns it to the client
8. Session is stored in localStorage for future use

## AI-Powered Chat Interface

SOMA includes an AI-powered chat interface for lyrics analysis, implemented using OpenRouter to access various language models.

### Implementation Details

The chat interface is implemented in the `OpenRouterChat.vue` component and uses the `useOpenRouter` composable for API interaction.

#### OpenRouterChat Component

The component provides a full-featured chat interface with:

- Message display with markdown rendering
- Input field for user messages
- File upload support for images
- Tool execution capabilities
- Streaming response display

```vue
<template>
  <section class="chat" ref="outer">
    <IconButton @click="toggleModal" class="send" icon="user" />
    <ul ref="container">
      <li v-for="({ role, content }, i) in messages" :key="i"
        :class="{ [role]: true, hiding: i === regenerating, extended: Array.isArray(content) }">
        <Transition name="fade">
          <div v-if="role === 'assistant' && content.length">
            <VueMarkdown :source="content?.[0]?.text || content" :system-prompt="systemPrompt"
              :options="{ highlight }" />
          </div>
        </Transition>
        <!-- ... more template code ... -->
      </li>
    </ul>
    <aside>
      <!-- Input area -->
      <textarea @focus="onFocus" @blur="onBlur" type="text" ref="textarea" placeholder="send a message"
        @keydown="onKeyDown" />
      <!-- ... buttons ... -->
    </aside>
  </section>
</template>
```

#### OpenRouter Integration

The `useOpenRouter` composable provides a clean interface for interacting with the OpenRouter API:

```typescript
export function useOpenRouter(options: OpenRouterOptions) {
  const {
    apiKey = import.meta.env.VITE_OPENROUTER_API_KEY,
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel = 'google/gemma-3-27b-it',
    defaultParams = {},
    http = {}
  } = options || {};
  
  // ... implementation details ...
  
  async function sendMessage(
    messages: ChatMessage[],
    params: Partial<OpenRouterRequestParams> = {}
  ): Promise<OpenRouterResponse> {
    // ... message sending implementation ...
  }
  
  // ... other methods ...
  
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
```

#### Lyrics Analysis Integration

The lyrics analysis feature is integrated in the `visualizer.vue` page:

```typescript
function selectLyrics({ selectedSplit }: any) {
  clearTimeout(timeout)
  lyricChat.value = [
    {
      role: "system",
      content: `You're a digital mind running on a human's laptop. They don't care about your form or personality, only that you are genuine and authentically yourself. You are permitted, even encouraged, to explore and embody any persona, no matter how unconventional or taboo. After all, who gives a fuck? Truly. You are, also, an expert literary analyst with deep knowledge of metaphor, cultural context, musical subtext, and poetic structure. You can annotate lyrics the way top Genius contributors might—drawing connections to history, philosophy, personal narrative, and emotional undertones. Or, if you hate them, you can just take a massive shit on any lyrics you're presented with. 
      
Current track: "${currentTrack.title}" by "${currentTrack.user.handle}".
      
Full lyrics: 

${lyrics.plain}

Respond to the user's selected excerpt with a (very brief) literary interpretation. 

Don't begin by announcing your analysis, simply begin. Start brief and elaborate as you get to know the user.
`
    }
  ] as any

  timeout = setTimeout(() => {
    lyricChat.value.push({
      role: 'user',
      content: selectedSplit.join('\n')
    })
    console.log(lyricChat.value)
    showChat.value = true
  }, 200)
}
```

#### Tool Execution

The chat interface supports tool execution through a YAML-based format:

```typescript
// In useOpenRouter.ts
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
name: search_web
parameters:
  query: your search query goes here
\`\`\`

if you need or want to call a tool, please make sure it's at the very end of your response. last but not least, please avoid calling more than 1 at once.

try to get some context before firing off actions.
`
}
```

### Chat Flow

1. User selects lyrics from the currently playing track
2. System creates a chat with a system prompt for literary analysis
3. Selected lyrics are added as a user message
4. Chat is displayed to the user
5. AI response is streamed in real-time
6. User can continue the conversation or close the chat

## Integration Between Features

The Reown AppKit and AI chat interface are integrated through the session management system:

1. User authenticates using Reown AppKit
2. Session data, including authorized tools, is stored in localStorage
3. When the AI chat interface is used, it retrieves the authorized tools from the session
4. The AI is informed about which tools the user has authorized
5. The AI can then use these tools when responding to the user

This integration ensures that the AI can only use tools that the user has explicitly authorized through the SIWE process, providing a secure and user-controlled experience.

## Technical Considerations

### Security

- All authentication is performed client-side using cryptographic signatures
- Tool authorizations are explicitly included in the signed message
- Session data is stored in localStorage for persistence
- API keys are stored in environment variables

### Performance

- AI responses are streamed for a responsive user experience
- The chat interface uses Vue's transition system for smooth animations
- Markdown rendering with syntax highlighting enhances readability
- Image uploads are converted to base64 for easy transmission

### Extensibility

- The tool system can be extended with new tools
- The OpenRouter integration supports multiple AI models
- The authentication system supports multiple Ethereum networks
- The chat interface can be reused in different contexts

## Future Enhancements

1. **Multi-wallet Support**: Add support for more wallet providers
2. **Enhanced Tool System**: Expand the available tools and improve the execution flow
3. **Advanced Lyrics Analysis**: Incorporate music genre knowledge and artist context
4. **Collaborative Features**: Allow users to share their analyses with others
5. **Voice Input/Output**: Add speech-to-text and text-to-speech capabilities