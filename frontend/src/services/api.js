import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skinsense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / invalidation (401 / 403 errors)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear invalid token from localStorage
      authService.logout();
      // Force redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/accounts/login/', { username, password });
    if (response.data.token) {
      localStorage.setItem('skinsense_token', response.data.token);
      localStorage.setItem('skinsense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  register: async (username, email, password) => {
    const response = await api.post('/accounts/register/', { username, email, password });
    if (response.data.token) {
      localStorage.setItem('skinsense_token', response.data.token);
      localStorage.setItem('skinsense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('skinsense_token');
    localStorage.removeItem('skinsense_user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('skinsense_user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('skinsense_token');
  }
};

export const scanService = {
  scan: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/prediction/scan/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/history/');
    return response.data;
  },
  
  deleteScan: async (scanId) => {
    const response = await api.delete(`/history/${scanId}/`);
    return response.data;
  }
};

export const recommendationService = {
  getRecommendations: async (condition) => {
    const response = await api.get(`/recommendation/${encodeURIComponent(condition)}/`);
    return response.data;
  }
};

export const storeService = {
  getProducts: async (condition = '') => {
    const url = condition && condition !== 'All' 
      ? `/store/products/?condition=${encodeURIComponent(condition)}` 
      : '/store/products/';
    const response = await api.get(url);
    return response.data;
  },
  validateCoupon: async (code) => {
    const response = await api.post('/store/coupons/validate/', { code });
    return response.data;
  },
  checkout: async (checkoutData) => {
    const response = await api.post('/store/checkout/', checkoutData);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get('/store/orders/');
    return response.data;
  },
  cancelOrder: async (orderId) => {
    const response = await api.patch(`/store/orders/${orderId}/`, { action: 'cancel' });
    return response.data;
  }
};

export const chatbotService = {
  getSupportedDiseases: async () => {
    const response = await api.get('/diseases/');
    return response.data;
  },
  
  getDiseaseDetail: async (idOrName) => {
    const response = await api.get(`/diseases/${encodeURIComponent(idOrName)}/`);
    return response.data;
  },
  
  askQuestion: async (condition, message, confidence = null, disease_id = null, page_context = '') => {
    const response = await api.post('/chatbot/ask/', { 
      condition, 
      message, 
      confidence,
      disease_id,
      page_context
    });
    return response.data;
  }
};

export default api;
