import api from './axios';

export const verificationApi = {
  submit: (data: {
    resumeUrl: string;
    portfolioUrl: string;
    idCardNumber: string;
    idCardUrl: string;
  }) => api.post('/verification/request', data),

  getStatus: () => api.get('/verification/status'),

  getAllRequests: () => api.get('/verification/admin/requests'),

  reviewRequest: (id: string, data: { status: 'Approved' | 'Rejected'; rejectionReason?: string }) =>
    api.post(`/verification/admin/requests/${id}/review`, data),
};
