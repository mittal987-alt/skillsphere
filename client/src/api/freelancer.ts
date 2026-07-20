import api from "./axios";

export const freelancerApi = {
  createProfile: (data: object) =>
    api.post("/freelancers", data),

  getMyProfile: () =>
    api.get("/freelancers/me"),

  updateProfile: (data: object) =>
    api.put("/freelancers/me", data),

  deleteProfile: () =>
    api.delete("/freelancers/me"),

  getById: (id: string) =>
    api.get(`/freelancers/${id}`),

  getAnalyticsDashboard: () => 
    api.get('/freelancers/analytics/dashboard'),
};