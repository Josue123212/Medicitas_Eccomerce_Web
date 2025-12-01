import { apiHelpers } from './api';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export const aiService = {
  chat: async (messages: ChatMessage[], model?: string): Promise<any> => {
    const m = model || (import.meta.env.VITE_GROQ_MODEL as string) || undefined;
    return apiHelpers.post('/ai/chat/', { messages, model: m });
  },
};
