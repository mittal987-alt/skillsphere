import api from './axios';

export const clientApi = {
  createProfile: (data: object) => api.post('/client', data),

  getMyProfile: () => api.get('/client/me'),

  updateProfile: (data: object) => api.put('/client/me', data),

  getById: (id: string) => api.get(`/client/${id}`),
};
