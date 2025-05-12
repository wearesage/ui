export type ChatRole = 'user' | 'assistant' | 'system' | 'function' | 'tool';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

export interface OpenRouterOptions {
  apiKey: string;
  apiUrl?: string;
  defaultModel?: string;
  defaultParams?: Partial<OpenRouterRequestParams>;
  http?: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  };
}

export interface OpenRouterRequestParams {
  model: string;
  models?: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  stop?: string[];
  stream?: boolean;
  user?: string;
  tools?: any[];
  tool_choice?: 'auto' | 'none' | { type: string; function: { name: string } };
}

export interface OpenRouterChoice {
  index: number;
  message?: {
    role: string;
    content: string;
  };
  text?: string;
  finish_reason: string | null;
  tool_calls?: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenRouterChoice[];
  usage?: OpenRouterUsage;
}

export interface OpenRouterStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
      tool_calls?: {
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }[];
    };
    index: number;
    finish_reason: string | null;
  }[];
}

export interface OpenRouterError {
  message: string;
  type: string;
  code: string | number;
  param?: string;
}