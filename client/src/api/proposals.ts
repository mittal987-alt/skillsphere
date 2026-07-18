import api from './axios';

export const proposalsApi = {
  submit: (data: { gigId: string; coverLetter: string; bidAmount: number; estimatedDays: number }) =>
    api.post('/proposals', data),

  getMyProposals: () => api.get('/proposals/my'),

  getGigProposals: (gigId: string) => api.get(`/proposals/gig/${gigId}`),

  accept: (id: string) => api.put(`/proposals/${id}/accept`),

  reject: (id: string) => api.put(`/proposals/${id}/reject`),

  withdraw: (id: string) => api.delete(`/proposals/${id}`),

  completeJob: (id: string) => api.put(`/proposals/${id}/complete`),

  approveJob: (id: string) => api.put(`/proposals/${id}/approve`),
};
