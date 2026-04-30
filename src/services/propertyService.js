import api from './api';

export const propertyService = {
  createProperty: (data) => api.post('/properties', data),
  getAllProperties: () => api.get('/properties'),
  getManagerProperties: () => api.get('/properties/manager'),
  getAgentProperties: () => api.get('/properties/agent'),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data),
  assignToManager: (id, email) => api.patch(`/properties/${id}/assign-manager?managerEmail=${email}`),
  assignToAgent: (id, email) => api.patch(`/properties/${id}/assign-agent?agentEmail=${email}`),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
};

export default propertyService;
