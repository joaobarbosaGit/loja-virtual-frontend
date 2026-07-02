import axios from 'axios';

import { getApiBaseUrl, saveApiBaseUrl } from './api-url.service';

type ApiActivityEvent =
  | { type: 'loading'; pendingRequests: number }
  | { type: 'error'; message: string };

type ApiActivityListener = (event: ApiActivityEvent) => void;

const apiActivityListeners = new Set<ApiActivityListener>();
let pendingRequests = 0;

const getRequestErrorMessage = (error: any) => (
  error?.response?.data?.message
  || error?.message
  || 'Nao foi possivel concluir a comunicacao com o servidor.'
);

const emitApiActivity = (event: ApiActivityEvent) => {
  apiActivityListeners.forEach((listener) => listener(event));
};

const setPendingRequests = (nextPendingRequests: number) => {
  pendingRequests = Math.max(nextPendingRequests, 0);
  emitApiActivity({ type: 'loading', pendingRequests });
};

export const subscribeApiActivity = (listener: ApiActivityListener) => {
  apiActivityListeners.add(listener);
  listener({ type: 'loading', pendingRequests });

  return () => {
    apiActivityListeners.delete(listener);
  };
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const updateApiBaseUrl = (baseUrl: string) => {
  const nextBaseUrl = saveApiBaseUrl(baseUrl);
  api.defaults.baseURL = nextBaseUrl;

  return nextBaseUrl;
};

api.interceptors.request.use((config) => {
  setPendingRequests(pendingRequests + 1);

  const token = localStorage.getItem('auth.token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  emitApiActivity({ type: 'error', message: getRequestErrorMessage(error) });
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  setPendingRequests(pendingRequests - 1);
  return response;
}, (error) => {
  setPendingRequests(pendingRequests - 1);
  emitApiActivity({ type: 'error', message: getRequestErrorMessage(error) });
  return Promise.reject(error);
});
