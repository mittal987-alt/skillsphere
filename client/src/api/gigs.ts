import api from './axios';

export const gigsApi = {
  getAll: (params?: {
    category?: string;
    skill?: string;
    minBudget?: number;
    maxBudget?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/gigs', { params }),

  getById: (id: string) => api.get(`/gigs/${id}`),

  create: (data: object) => api.post('/gigs', data),

  getMyGigs: () => api.get('/gigs/my'),

  update: (id: string, data: object) => api.put(`/gigs/${id}`, data),

  delete: (id: string) => api.delete(`/gigs/${id}`),
};
