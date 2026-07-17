import api from './axios';

export const clientApi = {
  createProfile: (data: object) => api.post('/clients', data),

  getMyProfile: () => api.get('/clients/me'),

  updateProfile: (data: object) => api.put('/clients/me', data),

  getById: (id: string) => api.get(`/clients/${id}`),
};
