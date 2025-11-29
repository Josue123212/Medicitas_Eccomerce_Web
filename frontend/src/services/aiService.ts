import { apiHelpers } from './api';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export const aiService = {
  chat: async (messages: ChatMessage[], model?: string): Promise<any> => {
    return apiHelpers.post('/ai/chat/', { messages, model });
  },
};

