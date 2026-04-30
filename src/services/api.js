import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Deduplication layer
const pending = new Map();

const originalGet = api.get;
api.get = (url, config) => {
  const key = `${url}:${JSON.stringify(config?.params || {})}`;
  if (pending.has(key)) return pending.get(key);
  
  const promise = originalGet(url, config).finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
};

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
