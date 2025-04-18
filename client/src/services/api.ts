import axios, { AxiosRequestConfig } from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request header if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      // Handle API errors with better messages
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400 && error.response.data.message === 'Email already in use') {
          throw new Error('This email is already registered. Please use a different email or try logging in.');
        }
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error('Registration failed. Please try again later.');
    }
  },
  
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      // Handle API errors with better messages
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error('Login failed. Please try again later.');
    }
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateDashboardConfig: async (config: any) => {
    const response = await api.put('/auth/dashboard-config', config);
    return response.data;
  },
};

// Data API
export const dataAPI = {
  // Data sources
  getDataSources: async () => {
    const response = await api.get('/data/sources');
    return response.data;
  },
  
  createDataSource: async (dataSourceData: any) => {
    const response = await api.post('/data/sources', dataSourceData);
    return response.data;
  },
  
  getDataSource: async (id: string) => {
    const response = await api.get(`/data/sources/${id}`);
    return response.data;
  },
  
  updateDataSource: async (id: string, data: any) => {
    const response = await api.put(`/data/sources/${id}`, data);
    return response.data;
  },
  
  deleteDataSource: async (id: string) => {
    const response = await api.delete(`/data/sources/${id}`);
    return response.data;
  },
  
  // Fetch data from a source
  fetchData: async (sourceId: string) => {
    const response = await api.get(`/data/fetch/${sourceId}`);
    return response.data;
  },
  
  // Sample data (no authentication required)
  getSampleData: async (source: string) => {
    const response = await api.get(`/data/sample/${source}`);
    return response.data;
  },
};

export default api;