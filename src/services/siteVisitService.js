import api from './api';

export const siteVisitService = {
  scheduleVisit: (data) => api.post('/site-visits', data),
  getVisitsByLead: (leadId) => api.get(`/site-visits/lead/${leadId}`),
  updateStatus: (id, status) => api.patch(`/site-visits/${id}/status?status=${status}`),
};

export default siteVisitService;
