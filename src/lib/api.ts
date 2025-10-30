import axios from 'axios';

// Assume your Flask backend is running on http://127.0.0.1:5000
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', 
});

// This interceptor reads the 'access_token' from localStorage
// and adds it to the Authorization header for every request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;