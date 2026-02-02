import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const api = axios.create({ //prevents creating URL Base everywhere
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
