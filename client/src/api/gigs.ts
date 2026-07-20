import api from './axios';

export const gigsApi = {
  getAll: (params?: {
    category?: string;
    skill?: string;
    experience?: string;
    minBudget?: number;
    maxBudget?: number;
    search?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  }) => {
    const finalParams = { ...params };
    if (finalParams.search) {
      finalParams.keyword = finalParams.search;
      delete finalParams.search;
    }
    return api.get('/search/gigs', { params: finalParams });
  },

  getById: (id: string) => api.get(`/gigs/${id}`),

  create: (data: object) => api.post('/gigs', data),

  getMyGigs: () => api.get('/gigs/my'),

  update: (id: string, data: object) => api.put(`/gigs/${id}`, data),

  delete: (id: string) => api.delete(`/gigs/${id}`),
};
