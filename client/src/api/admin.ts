import api from './axios';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),

  getUsers: () => api.get('/admin/users'),

  getUser: (id: string) => api.get(`/admin/users/${id}`),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  verifyFreelancer: (id: string) => api.put(`/admin/freelancers/${id}/verify`),

  getGigs: () => api.get('/admin/gigs'),

  deleteGig: (id: string) => api.delete(`/admin/gigs/${id}`),

  getPayments: () => api.get('/admin/payments'),

  getReviews: () => api.get('/admin/reviews'),
};
