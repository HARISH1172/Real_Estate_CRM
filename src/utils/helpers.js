export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const truncate = (str, max = 30) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  // If backend provided a specific message, use it
  const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
  if (backendMessage && typeof backendMessage === 'string') {
    return backendMessage;
  }

  // Fallback to status-based friendly messages
  const status = error?.response?.status;
  switch (status) {
    case 400: return 'Invalid request. Please check your information.';
    case 401: return 'Authentication failed. Please login again.';
    case 403: return 'Access denied. You do not have permission.';
    case 404: return 'The requested information could not be found.';
    case 409: return 'This record already exists.';
    case 500: return 'Server error. Our team has been notified.';
    case 503: return 'Service temporarily unavailable. Please try later.';
    default:
      if (error.message === 'Network Error') return 'Network error. Check your internet connection.';
      return error.message || 'Something went wrong. Please try again.';
  }
};
