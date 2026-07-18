import api from './axios';

export const paymentsApi = {
  /** Client: create a Razorpay order for an accepted proposal */
  createOrder: (data: { proposalId: string }) =>
    api.post('/payments/create-order', data),

  /** Client: verify Razorpay payment signature after checkout */
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post('/payments/verify', data),

  /** Client: release escrowed funds to freelancer */
  releasePayment: (paymentId: string) =>
    api.put(`/payments/release/${paymentId}`),

  /** Client: get own payment history */
  getMyPayments: () => api.get('/payments/my'),

  /** Freelancer: get own earnings */
  getFreelancerPayments: () => api.get('/payments/freelancer'),

  /** Admin: get all payments */
  getAllPayments: () => api.get('/payments'),
};
