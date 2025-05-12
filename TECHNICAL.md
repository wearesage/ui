# SOMA Technical Documentation

This document provides detailed technical information about the SOMA application architecture, implementation details, and development guidelines.

## Architecture Overview

SOMA follows a client-server architecture:

- **Frontend**: Vue.js 3 single-page application (SPA) with TypeScript
- **Backend**: Express.js REST API with MongoDB database

### System Architecture Diagram

```
┌─────────────────────────────────────┐      ┌─────────────────────────────────┐
│           Client (Browser)          │      │           SOMA Server           │
│                                     │      │                                 │
│  ┌─────────────┐    ┌────────────┐  │      │  ┌─────────────┐ ┌───────────┐ │
│  │   Vue.js    │    │  WebGL /   │  │      │  │  Express.js │ │  MongoDB  │ │
│  │ Application │◄───►│  Shaders   │  │      │  │    API     │ │  Database │ │
│  └─────────────┘    └────────────┘  │      │  └──────┬──────┘ └─────┬─────┘ │
│         │                           │      │         │              │       │
└─────────┼───────────────────────────┘      └─────────┼──────────────┼───────┘
          │                                            │              │
          │         ┌───────────────────────────┐      │              │
          └────────►│     External Services     │◄─────┘              │
                    │                           │                     │
                    │ - Spotify API             │                     │
                    │ - Audius API              │                     │
                    │ - Stripe                  │                     │
                    │ - AWS S3                  │                     │
                    │ - Twilio                  │                     │
                    │ - SendGrid                │                     │
                    └───────────────────────────┘                     │
                                 ▲                                    │
                                 │                                    │
                                 └────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure

The frontend follows a modular component-based architecture:

- **App.vue**: Root component that initializes the application
- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Composables**: Reusable logic (hooks)
- **Stores**: Global state management with Pinia

### State Management

SOMA uses Pinia for state management with the following key stores:

1. **editor**: Manages shader editing state
   - Shader code
   - Uniform values
   - Variants
   - Tweening between variants

2. **visualizer**: Manages visualization state
   - Audio source selection
   - Visualization settings
   - Stream time and volume

3. **audio**: Manages audio playback
   - Audio player controls
   - Audio analysis
   - Volume and frequency data

4. **shaders**: Manages shader collection
   - Published shaders
   - Thumbnails

5. **account**: Manages user account
   - Authentication state
   - User profile
   - Settings

### Rendering Pipeline

The WebGL rendering pipeline for visualizations:

1. Audio input is processed to extract volume and frequency data
2. GLSL shader is compiled with current uniform values
3. Shader is rendered to a WebGL canvas
4. Uniforms are updated in real-time based on audio data
5. Optional post-processing effects are applied

### Shader System

Shaders in SOMA follow this structure:

- **Fragment Shader**: GLSL code that defines the visualization
- **Uniforms**: Parameters that can be adjusted
  - Scalar values (floats)
  - Boolean toggles
  - Vector values (vec3)
- **Variants**: Different sets of uniform values for the same shader

## Backend Architecture

### API Structure

The backend API follows RESTful principles with these main areas:

- **/api/auth**: Authentication endpoints
- **/api/users**: User management
- **/api/studies**: Study management
- **/api/iterations**: Shader iteration management
- **/api/subscriptions**: Subscription management
- **/api/media**: Media file management

### Database Schema

The MongoDB database uses Mongoose schemas with these key models:

1. **User**: User accounts and profiles
2. **Study**: Collections of shader iterations
3. **Iteration**: Individual shader versions
4. **Subscription**: User subscription details
5. **Session**: User session data
6. **Invoice**: Payment invoices
7. **Gist**: Code snippets

### Authentication System

Authentication uses JWT (JSON Web Tokens) with:

- Token-based authentication
- Refresh token rotation
- Password hashing with bcrypt
- Optional phone-based authentication

### Plugin System

The server uses a plugin system for external service integrations:

- **spotify.js**: Spotify OAuth and API integration
- **stripe.js**: Stripe payment processing
- **twilio.js**: SMS messaging
- **s3.js**: AWS S3 file storage
- **audius.js**: Audius API integration
- **auth.js**: Authentication system

## WebGL and Shader Implementation

### Shader Structure

GLSL shaders in SOMA typically follow this structure:

```glsl
precision mediump float;

// Standard uniforms
uniform float time;      // Current time in seconds
uniform float volume;    // Audio volume (0.0 - 1.0)
uniform vec2 resolution; // Canvas resolution

// Custom uniforms
uniform float speed;     // Animation speed
uniform vec3 color;      // Primary color
uniform bool toggle;     // Feature toggle

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Visualization logic here
    
    gl_FragColor = vec4(color, 1.0);
}
```

### Uniform Types

SOMA supports these uniform types:

1. **Float** (type 0): Numeric values with optional min/max/integer constraints
2. **Boolean** (type 1): Toggle switches
3. **Vector3** (type 3): Three-component vectors, typically for colors

### Shader Rendering

The shader rendering process:

1. WebGL context is initialized
2. Shader program is compiled and linked
3. Uniforms are set based on current values
4. Render loop updates uniforms in real-time
5. Tweening between uniform sets is handled by interpolation

## Audio Processing

### Audio Sources

SOMA supports multiple audio sources:

1. **Spotify**: Uses Spotify Web Playback SDK
2. **Audius**: Uses Audius API
3. **Radio Paradise**: Streams audio from radio
4. **Microphone**: Uses WebAudio API for microphone input
5. **File Upload**: Allows local audio file playback

### Audio Analysis

Audio analysis is performed using Web Audio API:

1. Audio context is created
2. Analyzer node processes audio data
3. Frequency data is extracted using FFT
4. Volume data is calculated from frequency data
5. Data is normalized and passed to shaders as uniforms

## Development Guidelines

### Adding a New Audio Source

To add a new audio source:

1. Add the source to `AUDIO_SOURCES` in `constants/audio-sources.ts`
2. Create a new integration in `services/` if needed
3. Add source handling in `useVisualizer` store
4. Update the audio source selection UI

### Creating a New Shader

To create a new shader:

1. Start with a template or existing shader
2. Define required uniforms
3. Implement the main visualization logic
4. Create variants with different uniform values
5. Test with different audio sources

### Adding a New Uniform Type

To add a new uniform type:

1. Update the uniform tuple type definition
2. Add handling in the editor UI components
3. Implement interpolation for tweening
4. Update the shader compilation to handle the new type

## Performance Optimization

### Rendering Optimizations

- Use appropriate precision in shaders
- Limit complex calculations in fragment shaders
- Use resolution scaling based on device capabilities
- Implement frame skipping for low-end devices

### Memory Management

- Dispose WebGL resources when not needed
- Clean up audio contexts and connections
- Use shallowRef for large objects in Vue
- Implement lazy loading for shader thumbnails

## Deployment

### Build Process

The build process uses Vite:

1. TypeScript compilation
2. Vue SFC compilation
3. Asset optimization
4. Bundle minification
5. Output to `dist/` directory

### Environment Configuration

Environment variables are managed through `.env` files:

- `.env`: Default values
- `.env.development`: Development overrides
- `.env.production`: Production settings

Key environment variables:

- `VITE_SERVER`: API server URL
- `VITE_SPOTIFY_CLIENT_ID`: Spotify client ID
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key
- `DATABASE`: MongoDB connection string
- `PORT`: Server port

## Troubleshooting

### Common Issues

1. **WebGL Context Lost**
   - Cause: GPU resource exhaustion
   - Solution: Implement context restoration, reduce shader complexity

2. **Audio Playback Issues**
   - Cause: Browser autoplay policies
   - Solution: Require user interaction before playback

3. **Shader Compilation Errors**
   - Cause: GLSL syntax errors or unsupported features
   - Solution: Check shader code against WebGL 1.0 spec

4. **Performance Issues**
   - Cause: Complex shaders or inefficient code
   - Solution: Profile and optimize shader code, reduce resolution

## Future Technical Roadmap

1. **WebGL 2.0 Support**
   - Implement WebGL 2.0 features for more advanced shaders
   - Add compute shader support where available

2. **Audio Feature Extraction**
   - Implement more advanced audio analysis
   - Add beat detection and BPM tracking

3. **Collaborative Editing**
   - Real-time collaborative shader editing
   - Version control for shaders

4. **Mobile Optimization**
   - Touch-friendly UI for shader editing
   - Performance optimizations for mobile GPUs

5. **WebXR Integration**
   - VR/AR visualization support
   - Spatial audio integration