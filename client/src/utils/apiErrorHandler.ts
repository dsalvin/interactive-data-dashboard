import axios, { AxiosError } from 'axios';

/**
 * Format error messages from API responses
 */
export const formatApiError = (error: AxiosError): string => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const data = error.response.data as any;
    
    // Try to get the error message from the response
    if (data && data.message) {
      return data.message;
    } 
    
    // If there's no specific message, return a generic one based on status
    return `Error ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response received from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an error
    return error.message || 'An unknown error occurred';
  }
};

/**
 * Setup axios interceptors to handle common errors
 */
export const setupAxiosInterceptors = () => {
  // Response interceptor for API errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle session expiration (401 Unauthorized)
      if (error.response && error.response.status === 401) {
        // Check if it's not a login request
        if (!error.config.url?.includes('/auth/login')) {
          // Clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
};