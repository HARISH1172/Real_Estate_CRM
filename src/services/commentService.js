import api from './api';

const commentService = {
  getCommentsByLead: (leadId) => api.get(`/leads/comments/${leadId}`),
  addComment: (leadId, content) => api.post(`/leads/comments/${leadId}`, content, {
    headers: { 'Content-Type': 'text/plain' }
  }),
};

export default commentService;
