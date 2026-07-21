import api from './axios';

export const getFreelancerRecommendationsForGig = async (gigId: string) => {
  const response = await api.get(`/ai/recommend/${gigId}`);
  return response.data;
};

export const getGigRecommendationsForFreelancer = async () => {
  const response = await api.get('/ai/gig-recommendations');
  return response.data;
};

export const generateAICoverLetter = async (gigId: string) => {
  const response = await api.post('/ai/generate-cover-letter', { gigId });
  return response.data;
};

export const enhanceGigDescription = async (data: { title: string; description: string; category?: string }) => {
  const response = await api.post('/ai/enhance-gig-description', data);
  return response.data;
};
