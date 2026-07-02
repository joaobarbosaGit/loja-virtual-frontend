import { environments } from '../environments';

const API_BASE_URL_STORAGE_KEY = 'app.apiBaseUrl';

const normalizeApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const storedUrl = localStorage.getItem(API_BASE_URL_STORAGE_KEY);

  return normalizeApiBaseUrl(storedUrl || environments.apiBaseUrl);
};

export const saveApiBaseUrl = (value: string) => {
  const normalizedUrl = normalizeApiBaseUrl(value);
  const url = new URL(normalizedUrl);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Informe uma URL iniciando com http:// ou https://.');
  }

  localStorage.setItem(API_BASE_URL_STORAGE_KEY, normalizedUrl);

  return normalizedUrl;
};
