// src/axiosInstance.js
import axios from 'axios';

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000, // Set a timeout for requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip adding token for login and signup endpoints
    const publicEndpoints = ['/user/login', '/user/signup'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/user/login') {
        window.location.href = '/user/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
