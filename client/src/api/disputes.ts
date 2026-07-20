import api from './axios';

export const disputesApi = {
  getAll: () => api.get('/disputes'),

  file: (data: {
    gigId: string;
    milestoneId: string;
    reason: string;
    evidenceMessage: string;
    evidenceFile?: string;
  }) => api.post('/disputes', data),

  submitEvidence: (id: string, data: { message: string; fileUrl?: string }) =>
    api.post(`/disputes/${id}/evidence`, data),

  resolve: (id: string, data: { decision: 'Refunded' | 'Released'; notes: string }) =>
    api.post(`/disputes/${id}/resolve`, data),
};
