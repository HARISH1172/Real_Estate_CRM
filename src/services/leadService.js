import api from './api';

export const leadService = {
  createLead: (data) => api.post('/leads', data),
  getAllLeads: () => api.get('/leads'),
  getLeadById: (id) => api.get(`/leads/${id}`),
  updateLead: (id, data) => api.put(`/leads/${id}`, data),
  assignLead: (id, agentEmail) => api.patch(`/leads/${id}/assign?agentEmail=${agentEmail}`),
  getMyLeads: () => api.get('/leads'),
  deleteLead: (id) => api.delete(`/leads/${id}`),
  updateLeadStatus: (id, status) => api.patch(`/leads/${id}/status?status=${status}`),
  getLeadsByAgent: (email) => api.get(`/leads/agent/${email}`),
};

export default leadService;
