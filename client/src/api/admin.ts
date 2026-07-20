import api from './axios';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Users
  getUsers: () => api.get('/admin/users'),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  banUser: (id: string) => api.put(`/admin/users/${id}/ban`),

  // Freelancers
  verifyFreelancer: (id: string) => api.put(`/admin/freelancers/${id}/verify`),

  // Gigs
  getGigs: () => api.get('/admin/gigs'),
  deleteGig: (id: string) => api.delete(`/admin/gigs/${id}`),

  // Payments
  getPayments: () => api.get('/admin/payments'),

  // Reviews
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
};
