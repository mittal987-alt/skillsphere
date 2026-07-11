import api from './axios';

export const paymentsApi = {
  createOrder: (data: { gigId: string; freelancerId: string; amount: number }) =>
    api.post('/payments/create-order', data),

  verifyPayment: (data: object) => api.post('/payments/verify', data),

  getMyPayments: () => api.get('/payments/my'),

  getFreelancerPayments: () => api.get('/payments/freelancer'),

  getAllPayments: () => api.get('/payments'),
};
