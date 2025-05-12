# Contributing to SOMA

Thank you for your interest in contributing to SOMA! This guide will help you set up your development environment and understand the contribution workflow.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [Shader Development Guidelines](#shader-development-guidelines)
8. [Documentation](#documentation)

## Development Environment Setup

### Prerequisites

- Node.js (v16+)
- npm (v8+)
- MongoDB (v5+)
- Git

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/your-organization/soma.git
cd soma
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=2223
DATABASE=mongodb://localhost:27017/soma
NODE_ENV=development

# Spotify
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
VITE_SPOTIFY_REDIRECT_URI=http://localhost:2223/api/spotify/callback

# Stripe
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
```

4. **Start MongoDB**

Make sure MongoDB is running on your system:

```bash
# On most systems
sudo systemctl start mongodb

# On macOS with Homebrew
brew services start mongodb-community
```

5. **Start the development server**

```bash
npm run dev
```

This will start both the frontend and backend servers:
- Frontend: http://localhost:5173
- Backend: http://localhost:2223

## Project Structure

Understanding the project structure is essential for effective contributions:

```
soma/
├── public/            # Static assets
├── server/            # Backend code
│   ├── base.js        # Server setup
│   ├── index.js       # Entry point
│   ├── plugins/       # Server plugins
│   ├── schemas/       # Database schemas
│   └── util/          # Utilities
├── src/               # Frontend code
│   ├── api/           # API clients
│   ├── assets/        # Frontend assets
│   ├── classes/       # TypeScript classes
│   ├── components/    # Vue components
│   ├── composables/   # Vue composables
│   ├── constants/     # Constants
│   ├── pages/         # Page components
│   ├── services/      # Service layer
│   ├── stores/        # Pinia stores
│   ├── styles/        # SCSS styles
│   ├── util/          # Utilities
│   ├── App.vue        # Root component
│   └── main.ts        # Entry point
├── .env               # Environment variables
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
└── vite.config.ts     # Vite config
```

## Development Workflow

### Feature Development

1. **Create a new branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

3. **Run the development server**

```bash
npm run dev
```

4. **Test your changes**

5. **Commit your changes**

```bash
git add .
git commit -m "feat: add your feature description"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

6. **Push your changes**

```bash
git push origin feature/your-feature-name
```

7. **Create a pull request**

### Bug Fixes

1. **Create a new branch**

```bash
git checkout -b fix/bug-description
```

2. **Fix the bug**

3. **Test your fix**

4. **Commit your changes**

```bash
git add .
git commit -m "fix: fix the bug description"
```

5. **Push your changes**

```bash
git push origin fix/bug-description
```

6. **Create a pull request**

## Coding Standards

### General Guidelines

- Use TypeScript for type safety
- Follow the existing code style
- Write self-documenting code with clear variable and function names
- Add comments for complex logic
- Keep functions small and focused on a single responsibility
- Use async/await for asynchronous code

### Vue Components

- Use Vue 3 Composition API with `<script setup>` syntax
- Keep components small and focused
- Use props and emits for component communication
- Use composables for reusable logic
- Follow the naming conventions:
  - PascalCase for component names
  - camelCase for props, methods, and variables
  - kebab-case for events

### TypeScript

- Define interfaces for all data structures
- Use type annotations for function parameters and return types
- Avoid using `any` type when possible
- Use generics for reusable components and functions

### CSS/SCSS

- Use SCSS for styling
- Follow BEM (Block Element Modifier) methodology
- Use variables for colors, spacing, and other repeated values
- Keep styles scoped to components when possible

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend
```

### Writing Tests

- **Frontend**: Use Vue Test Utils and Jest
- **Backend**: Use Mocha and Chai
- **End-to-End**: Use Cypress

### Test Coverage

Aim for at least 80% test coverage for new code.

## Pull Request Process

1. **Create a pull request** from your feature branch to the main branch
2. **Fill out the pull request template** with:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if applicable)
3. **Request reviews** from team members
4. **Address review comments**
5. **Wait for approval** from at least one reviewer
6. **Merge the pull request** once approved

## Shader Development Guidelines

### GLSL Best Practices

- Use appropriate precision qualifiers
- Minimize branching in shader code
- Avoid expensive operations like division and trigonometric functions
- Use built-in functions when available
- Comment complex algorithms

### Creating New Shaders

1. Start with a template or existing shader
2. Define required uniforms
3. Implement the main visualization logic
4. Create variants with different uniform values
5. Test with different audio sources

### Uniform Naming Conventions

- Use descriptive names for uniforms
- Prefix with the type of control:
  - `slider_` for numeric values
  - `toggle_` for boolean values
  - `color_` for color values

### Performance Considerations

- Keep shader complexity reasonable
- Test on different devices and GPUs
- Provide fallbacks for complex effects
- Use resolution scaling for performance

## Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms
- Keep documentation up-to-date with code changes

### Component Documentation

- Document props, events, and slots
- Provide usage examples
- Document any non-obvious behavior

### API Documentation

- Document all API endpoints
- Specify request and response formats
- Document error responses

## Continuous Integration

We use GitHub Actions for continuous integration:

- Linting
- Type checking
- Unit tests
- Build verification

All checks must pass before a pull request can be merged.

## License

By contributing to SOMA, you agree that your contributions will be licensed under the project's license.

## Questions?

If you have any questions or need help, please:

1. Check the existing documentation
2. Ask in the project's discussion forum
3. Contact the maintainers

Thank you for contributing to SOMA!