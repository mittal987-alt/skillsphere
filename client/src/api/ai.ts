import api from './axios';

export const getFreelancerRecommendationsForGig = async (gigId: string) => {
  const response = await api.get(`/ai/recommend/${gigId}`);
  return response.data;
};

export const getGigRecommendationsForFreelancer = async () => {
  const response = await api.get('/ai/gig-recommendations');
  return response.data;
};
