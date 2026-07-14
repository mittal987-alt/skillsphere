import api from './axios';

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getMonthlyRevenue: () => api.get('/analytics/revenue'),
  getMonthlyUsers: () => api.get('/analytics/users'),
  getTopFreelancers: () => api.get('/analytics/top-freelancers'),
  getTopClients: () => api.get('/analytics/top-clients'),
  getTopSkills: () => api.get('/analytics/top-skills'),
  getPlatformStats: () => api.get('/analytics/platform'),
};
