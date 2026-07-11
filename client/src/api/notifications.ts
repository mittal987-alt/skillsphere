import api from './axios';

export const notificationsApi = {
  getMyNotifications: () => api.get('/notifications'),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put('/notifications/read-all'),

  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};
