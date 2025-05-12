# SOMA User Guide

This guide provides instructions on how to use SOMA's key features, with a focus on the wallet-based authentication and AI-powered lyrics analysis.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Wallet Authentication](#wallet-authentication)
3. [Music Visualization](#music-visualization)
4. [Lyrics Analysis](#lyrics-analysis)
5. [Shader Selection](#shader-selection)
6. [Settings](#settings)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Ethereum wallet (MetaMask, WalletConnect, etc.)
- Internet connection

### Accessing SOMA

1. Visit the SOMA website
2. You'll be presented with the home page
3. Click "Enter" to access the application

## Wallet Authentication

SOMA uses Sign-In with Ethereum (SIWE) for secure, wallet-based authentication.

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the top right corner
2. A modal will appear showing available wallet options
3. Select your preferred wallet (e.g., MetaMask, WalletConnect)
4. Follow your wallet's prompts to connect

![Wallet Connection](assets/wallet-connection.png)

### Signing the Message

After connecting your wallet, you'll need to sign a message to authenticate:

1. Review the message, which includes:
   - The application domain
   - A statement about authorizing tools
   - A list of tools you're authorizing
2. Click "Sign" in your wallet to approve
3. Wait for the authentication to complete

![Message Signing](assets/message-signing.png)

### Tool Authorization

The message you sign includes authorization for specific tools:

```
Sign in and authorize agent tools.

Tools to authorize:
- search_web: Search the web for information
- fetch_lyrics: Fetch lyrics for the current track
- analyze_sentiment: Analyze the sentiment of text
```

By signing this message, you're explicitly authorizing these tools to be used by the AI assistant.

### Session Management

Once authenticated:
- Your session will persist until you sign out
- You can view your connected wallet address in the top right
- Click your address to access account options
- Select "Disconnect" to end your session

## Music Visualization

### Selecting an Audio Source

1. Click the audio source selector in the visualizer
2. Choose from available sources:
   - Spotify (requires Spotify account)
   - Audius
   - Radio Paradise
   - Microphone input
   - File upload

![Audio Sources](assets/audio-sources.png)

### Controlling Playback

Use the player controls to manage audio playback:
- Play/Pause: Toggle playback
- Next/Previous: Change tracks (for Spotify and Audius)
- Volume: Adjust audio level
- Progress bar: Skip to different parts of the track

## Lyrics Analysis

SOMA features an AI-powered lyrics analysis tool that provides literary interpretations of song lyrics.

### Viewing Lyrics

1. While a track is playing, click the "Lyrics" button
2. The lyrics for the current track will be displayed
3. Lyrics will automatically scroll in sync with the music

![Lyrics Display](assets/lyrics-display.png)

### Analyzing Lyrics

1. Select specific lyrics by clicking and dragging across the text
2. The AI chat interface will appear
3. The AI will provide a literary analysis of the selected lyrics
4. You can continue the conversation to explore deeper meanings

![Lyrics Analysis](assets/lyrics-analysis.png)

### Chat Interface Features

The AI chat interface includes several features:
- **Markdown Support**: Formatted text with headings, lists, etc.
- **Code Highlighting**: Proper formatting for code snippets
- **Image Upload**: Drag and drop images into the chat
- **Tool Execution**: The AI can use authorized tools
- **Streaming Responses**: See the AI's response as it's generated

### Example Conversation

```
User: [Selected lyrics: "And in the end, the love you take is equal to the love you make"]

AI: A perfect distillation of the Beatles' philosophy. This line from "The End" serves as both conclusion and thesis statement for their entire catalog. It's a karmic equation that balances giving and receiving, suggesting that love operates as a closed system where nothing is truly lost.

The simplicity of the phrasing belies its philosophical depth - it's reminiscent of Newton's third law (for every action, there's an equal and opposite reaction) but applied to emotional exchange rather than physics.

User: What makes this line so memorable?

AI: Its memorability comes from several elements working in harmony:

1. Rhythmic symmetry - the line has a perfect balance, almost like a scale weighing "love you take" against "love you make"

2. Universal truth in simple language - it expresses a profound concept without complex vocabulary

3. Musical placement - as the final lyric before the closing piano notes, it serves as the parting message of the album

4. Mnemonic qualities - the rhyme of "take/make" creates a natural hook for memory

5. Cultural resonance - it taps into ancient wisdom traditions while feeling thoroughly modern

The line achieves what great poetry does - it feels simultaneously like something you've always known and something you're realizing for the first time.
```

## Shader Selection

### Browsing Shaders

1. Click "Designs" in the main navigation
2. Browse the gallery of available shaders
3. Click on a shader to preview it
4. Click "Select" to use the shader in the visualizer

![Shader Gallery](assets/shader-gallery.png)

### Shader Editor

For advanced users, SOMA includes a shader editor:

1. Click the editor toggle in the visualizer
2. Modify the GLSL code to create your own visualization
3. Adjust uniforms using the controls on the right
4. Save your creation to use it later

## Settings

### Visualizer Settings

1. Click "Settings" in the main navigation
2. Adjust the following settings:

#### Display Settings

- **Resolution**: Adjust the rendering resolution
- **Retina Support**: Enable for high-DPI displays
- **Reduce Flashing**: Reduce intensity of flashing effects

#### Playback Settings

- **Shuffle Designs**: Automatically change visualizations
- **Shuffle Interval**: Set how often designs change
- **Speed**: Adjust animation speed
- **Volume Sensitivity**: Adjust how responsive visuals are to volume

#### Interface Settings

- **Always Show Album Artwork**: Keep album art visible
- **Always Show Track Info**: Keep track info visible
- **Always Show Player Controls**: Keep player controls visible
- **Resume Last Audio Source**: Automatically select the last used audio source

### Account Settings

- **Connected Wallet**: View your connected wallet address
- **Authorized Tools**: View and manage tool authorizations
- **Theme**: Choose between light and dark themes
- **Notifications**: Manage notification preferences

## Troubleshooting

### Wallet Connection Issues

If you're having trouble connecting your wallet:

1. Ensure your wallet is unlocked
2. Check that you're on the correct network (Ethereum Mainnet or Arbitrum)
3. Clear your browser cache and try again
4. Try a different browser or device

### Audio Playback Issues

If you're experiencing audio playback problems:

1. Check your device volume and unmute if necessary
2. Ensure you have granted the necessary permissions
3. For Spotify, verify that your Spotify account is active
4. Try a different audio source to isolate the issue

### Visualization Performance

If visualizations are running slowly:

1. Lower the resolution in settings
2. Disable retina support
3. Choose less complex visualizations
4. Close other resource-intensive applications

### AI Chat Issues

If the AI chat is not working properly:

1. Check your internet connection
2. Verify that you've authenticated with your wallet
3. Try selecting different lyrics
4. Refresh the page and try again

### Getting Help

If you continue to experience issues:

1. Check the FAQ section on the website
2. Join the SOMA community forum
3. Contact support through the "Help" button
4. Report bugs through the GitHub repository

## Keyboard Shortcuts

- **Space**: Play/Pause
- **F**: Toggle fullscreen
- **M**: Mute/Unmute
- **Left Arrow**: Previous track
- **Right Arrow**: Next track
- **Up Arrow**: Volume up
- **Down Arrow**: Volume down
- **S**: Toggle shuffle designs
- **L**: Toggle lyrics
- **E**: Toggle editor
- **Esc**: Exit fullscreen or close modal