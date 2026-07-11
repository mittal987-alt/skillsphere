import api from './axios';

export const freelancerApi = {
  createProfile: (data: object) => api.post('/freelancer', data),

  getMyProfile: () => api.get('/freelancer/me'),

  updateProfile: (data: object) => api.put('/freelancer/me', data),

  deleteProfile: () => api.delete('/freelancer/me'),

  getById: (id: string) => api.get(`/freelancer/${id}`),
};
