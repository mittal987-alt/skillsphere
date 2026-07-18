import api from './axios';

export const reviewsApi = {
  createReview: (data: { freelancerId: string; gigId: string; rating: number; review: string }) =>
    api.post('/reviews', data),

  updateReview: (id: string, data: { rating: number; review: string }) =>
    api.put(`/reviews/${id}`, data),

  deleteReview: (id: string) => api.delete(`/reviews/${id}`),

  getFreelancerReviews: (id: string) => api.get(`/reviews/freelancer/${id}`),




  getGigReviews: (gigId: string) => api.get(`/reviews/gig/${gigId}`),
};
export const proposalApi = {

    completeJob: (id: string) =>
        api.put(`/proposals/${id}/complete`),

    approveJob: (id: string) =>
        api.put(`/proposals/${id}/approve`),

};
