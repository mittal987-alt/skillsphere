import api from './axios';

export const chatApi = {
  getConversations: () => api.get('/chat'),

  getMessages: (conversationId: string) => api.get(`/chat/${conversationId}`),

  sendMessage: (data: { conversationId: string; message: string; attachments?: string[] }) =>
    api.post('/chat/send', data),

  markSeen: (messageId: string) => api.put(`/chat/${messageId}/seen`),
};
