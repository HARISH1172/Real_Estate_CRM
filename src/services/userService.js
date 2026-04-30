import api from './api';

/**
 * All user-management and dashboard API calls.
 */
const userService = {
  /* ── Admin: Manager management ── */
  createManager: (data) => api.post('/admin/create-manager', data),
  updateUser: (email, data) => api.put(`/admin/user/${email}`, data),
  deleteUser: (email) => api.delete(`/admin/user/${email}`),

  /* ── Manager: Agent management ── */
  getManagerAgents: () => api.get('/manager/agents'),

  approveAgent: (agentEmail, managerEmail) => 
    api.patch(`/admin/approve-agent/${agentEmail}?managerEmail=${managerEmail}`),

  assignManagerToAgent: (agentEmail, managerEmail) => 
    api.patch(`/admin/agents/${agentEmail}/assign-manager?managerEmail=${managerEmail || ''}`),

  /* ── User Lists ── */
  getAgents: () => api.get('/admin/agents'),
  getManagers: () => api.get('/admin/managers'),

  /* ── Dashboard stats ── */
  getDashboardStats: () => api.get('/dashboard/stats'),
  getDailyTrend: (month) => api.get(`/dashboard/daily-trend?month=${month}`),
};

export default userService;
