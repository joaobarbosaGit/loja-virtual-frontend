import axios from 'axios';

import { environments } from '../environments';

export const api = axios.create({
  baseURL: environments.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth.token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
