import api from './api';

export const followUpService = {
  scheduleFollowUp: (data) => api.post('/follow-ups', data),
  getFollowUpsByLead: (leadId) => api.get(`/follow-ups/lead/${leadId}`),
  updateStatus: (id, status) => api.patch(`/follow-ups/${id}/status?status=${status}`),
};

export default followUpService;
