import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user info from localStorage
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('quizAppUser');
    if (user) {
      const userData = JSON.parse(user);
      config.headers['User-Id'] = userData._id;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;