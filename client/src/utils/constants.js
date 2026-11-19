export const DEFAULT_MODELS = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'openai/gpt-oss-120b',
    displayName: 'GPT OSS 120B (Groq)',
    contextWindow: 131072,
    developer: 'OpenAI / Groq',
    description: 'High performance frontier open-source model hosted on Groq LPU'
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'llama-3.3-70b-versatile',
    displayName: 'Llama 3.3 70B Versatile',
    contextWindow: 128000,
    developer: 'Meta',
    description: 'State-of-the-art multilingual model with high reasoning and speed'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'llama-3.1-8b-instant',
    displayName: 'Llama 3.1 8B Instant',
    contextWindow: 128000,
    developer: 'Meta',
    description: 'Ultra-fast lightweight model ideal for instant responses'
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'deepseek-r1-distill-llama-70b',
    displayName: 'DeepSeek R1 Distill Llama 70B',
    contextWindow: 128000,
    developer: 'DeepSeek',
    description: 'Advanced reasoning model with chain-of-thought capabilities'
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'mixtral-8x7b-32768',
    displayName: 'Mixtral 8x7B',
    contextWindow: 32768,
    developer: 'Mistral AI',
    description: 'High-quality mixture of experts model'
  },
  {
    id: 'gemma2-9b-it',
    name: 'gemma2-9b-it',
    displayName: 'Gemma 2 9B IT',
    contextWindow: 8192,
    developer: 'Google',
    description: 'Google’s instruction-tuned open weights model'
  }
];

export const DEFAULT_PARAMETERS = {
  model: 'openai/gpt-oss-120b',
  temperature: 1,
  max_completion_tokens: 2048,
  reasoning_effort: 'low',
  stream: true,
  json_mode: false,
  tools: {
    browserSearch: false,
    codeInterpreter: false,
  },
  customFunctions: [],
};

export const STORAGE_KEYS = {
  MESSAGES: 'groq_playground_messages_v1',
  SYSTEM_PROMPT: 'groq_playground_system_prompt_v1',
  PARAMETERS: 'groq_playground_parameters_v1',
  CUSTOM_API_KEY: 'groq_playground_custom_api_key_v1',
};
