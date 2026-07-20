import api from './axios';

export const milestonesApi = {
  fund: (gigId: string, milestoneId: string) =>
    api.post(`/milestones/${gigId}/${milestoneId}/fund`),

  submit: (gigId: string, milestoneId: string, data: { message: string; fileUrl?: string }) =>
    api.post(`/milestones/${gigId}/${milestoneId}/submit`, data),

  approve: (gigId: string, milestoneId: string) =>
    api.post(`/milestones/${gigId}/${milestoneId}/approve`),

  reject: (gigId: string, milestoneId: string, data: { rejectionReason: string }) =>
    api.post(`/milestones/${gigId}/${milestoneId}/reject`, data),
};
