# SOMA Music Visualization Platform

SOMA is a sophisticated music visualization platform that combines real-time GLSL shader-based visualizations with AI-powered features and blockchain integration.

## Key Features

### Music Visualization
- Real-time GLSL shader-based visualizations
- Multiple audio sources (Spotify, Audius, Radio Paradise, microphone input)
- Customizable visualization settings
- Shader editor for creating and modifying visualizations

### AI-Powered Lyrics Analysis
- Interactive lyrics display with selection capability
- AI-powered literary analysis of selected lyrics
- Real-time chat interface for discussing lyrical content
- Contextual understanding of the current track and its themes

### Blockchain Integration
- Secure authentication using Reown AppKit
- Sign-In with Ethereum (SIWE) for wallet-based authentication
- Tool authorization through signed messages
- Cross-chain support (Ethereum mainnet, Arbitrum)

## Technology Stack

### Frontend
- Vue.js 3 with TypeScript
- Vite as the build tool
- Pinia for state management
- WebGL for shader rendering
- D3.js for animations and transitions

### Backend
- Express.js server
- MongoDB with Mongoose
- JWT and bcrypt for authentication
- Various API integrations (Spotify, Audius, etc.)

### AI & Blockchain
- OpenRouter for AI model access
- Reown AppKit for blockchain integration
- Ethers.js for Ethereum interaction
- SIWE (Sign-In with Ethereum) for authentication

## Highlighted Features

### Reown AppKit Integration

SOMA uses [Reown AppKit](https://docs.reown.xyz/appkit) for secure blockchain authentication and interaction:

```typescript
// Authentication setup with Reown AppKit
createAppKit({
  adapters: [new Ethers5Adapter()],
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  networks: [mainnet, arbitrum],
  siweConfig
});
```

Key capabilities:
- **Wallet Connection**: Seamless connection to various Ethereum wallets
- **SIWE Authentication**: Secure Sign-In with Ethereum
- **Cross-Chain Support**: Works with multiple Ethereum-compatible networks
- **Tool Authorization**: Users authorize specific tools through signed messages
- **Session Management**: Secure session handling with localStorage

### AI-Powered Lyrics Analysis

The visualizer includes an AI-powered lyrics analysis feature:

```typescript
// System prompt for the AI lyrics analyst
const systemPrompt = `You're a digital mind running on a human's laptop. 
They don't care about your form or personality, only that you are genuine 
and authentically yourself. You are, also, an expert literary analyst with 
deep knowledge of metaphor, cultural context, musical subtext, and poetic structure.`;
```

Key capabilities:
- **Lyrics Selection**: Users can select specific lyrics from the currently playing track
- **Literary Analysis**: AI provides insightful analysis of lyrical content
- **Interactive Chat**: Users can discuss and explore the meaning of lyrics
- **Contextual Understanding**: AI has access to the full lyrics and track information
- **Streaming Responses**: Real-time streaming of AI responses for a fluid experience

The AI chat interface is implemented using OpenRouter, allowing access to powerful language models:

```typescript
// OpenRouter integration for AI chat
const {
  loading,
  error,
  streamingContent,
  isStreaming,
  sendMessage,
  cancelRequest
} = useOpenRouter({ defaultModel: 'google/gemma-3-27b-it' });
```

## Architecture

### Component Structure

- **App.vue**: Root component that initializes the application
- **Visualizer**: Main visualization component with shader rendering
- **OpenRouterChat**: AI chat interface for lyrics analysis
- **GLSLEditor**: Shader editor for creating and modifying visualizations
- **Authentication**: Reown AppKit integration for blockchain authentication

### Data Flow

1. User authenticates using Reown AppKit (SIWE)
2. User selects an audio source (Spotify, Audius, etc.)
3. Visualizer renders shaders based on audio input
4. User can select lyrics to analyze
5. Selected lyrics are sent to AI via OpenRouter
6. AI response is streamed back to the user in real-time

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Ethereum wallet (for authentication)
- OpenRouter API key (for AI features)
- Reown AppKit project ID

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-organization/soma.git
cd soma
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_REOWN_PROJECT_ID=your_reown_project_id
```

4. Start the development server:
```bash
npm run dev
```

## Documentation

SOMA includes comprehensive documentation to help users and developers understand and extend the platform:

- [**User Guide**](USER_GUIDE.md) - Detailed instructions for using SOMA, including wallet authentication and lyrics analysis
- [**Technical Features**](TECHNICAL_FEATURES.md) - In-depth technical documentation of the Reown AppKit integration and AI chat interface
- [**Developer Reference**](DEVELOPER_REFERENCE.md) - Quick reference guide for developers who want to integrate with or extend the platform

## Usage

### Music Visualization

1. Connect your Ethereum wallet using the Reown AppKit interface
2. Select an audio source (Spotify, Audius, Radio Paradise, etc.)
3. Enjoy the visualization that responds to the audio
4. Use the settings to customize the visualization experience

### Lyrics Analysis

1. While a track is playing, click on the lyrics display
2. Select specific lyrics you want to analyze
3. The AI chat interface will appear with an analysis of the selected lyrics
4. Continue the conversation to explore deeper meanings and interpretations

### Shader Editing

1. Click the editor toggle in the visualizer
2. Modify the GLSL code to create your own visualization
3. Adjust uniforms to fine-tune the visualization
4. Save your creation to use it later

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)