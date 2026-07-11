import api from './axios';

export const reviewsApi = {
  createReview: (data: { freelancerId: string; gigId: string; rating: number; comment: string }) =>
    api.post('/reviews', data),

  updateReview: (id: string, data: { rating: number; comment: string }) =>
    api.put(`/reviews/${id}`, data),

  deleteReview: (id: string) => api.delete(`/reviews/${id}`),

  getFreelancerReviews: (id: string) => api.get(`/reviews/freelancer/${id}`),

  getGigReviews: (gigId: string) => api.get(`/reviews/gig/${gigId}`),
};
