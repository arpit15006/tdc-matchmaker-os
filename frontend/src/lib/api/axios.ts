import axios, { AxiosError } from 'axios';
import { clearToken, emitLogout, getToken } from '../auth/token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      emitLogout();
    }
    return Promise.reject(error);
  }
);

export interface ApiErrorShape {
  error: { code: string; message: string; details?: unknown };
}

/** Extract a human-readable message from an axios error. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorShape | undefined;
    return data?.error?.message ?? err.message ?? fallback;
  }
  return fallback;
}
