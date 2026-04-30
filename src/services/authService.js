import api from './api';

/**
 * Matches AuthController: POST /api/auth/register & /api/auth/login
 * RegisterRequestDTO: { name, email, password, phone, role, address: {street, city, state, pincode} }
 * LoginRequestDTO:    { email, password }
 * Response:           AuthResponseDTO { token, name, email, role, ... }
 */
const authService = {
  sendOtp: (email) => api.post(`/auth/send-otp?email=${email}`),
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
