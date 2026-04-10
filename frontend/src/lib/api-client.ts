import type { ApiError } from '../types';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  if (typeof window !== 'undefined') {
    // If we're on a domain like klixticket.com, use that domain for API
    if (window.location.hostname !== 'localhost') {
      return `${window.location.protocol}//${window.location.hostname}/api/v1`;
    }
  }
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getBaseUrl();
export const IMAGE_BASE_URL = import.meta.env.VITE_SERVER_URL || API_BASE_URL.replace('/api/v1', '');

export class RequestError extends Error {
  status: string;
  errors?: Record<string, string>;

  constructor(message: string, status: string, errors?: Record<string, string>) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
    this.errors = errors;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Handle API responses and standardize errors
 */
export async function handleResponse<T>(res: Response): Promise<T> {
  // If no content (204), return empty object
  if (res.status === 204) return {} as T;

  let data;
  try {
    data = await res.json();
  } catch (e) {
    // If response is not JSON
    if (!res.ok) {
        throw new RequestError('Respon server tidak valid', res.status.toString());
    }
    return {} as T;
  }

  if (!res.ok) {
    // 1. Auto-redirect on 401 Unauthorized
    if (res.status === 401) {
      console.warn('Session expired or unauthorized. Redirecting to login...');
      // Clear token to avoid endless loops
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Only redirect if not already on login/register page
      const currentPath = window.location.pathname;
      if (!['/login', '/register', '/auth'].includes(currentPath)) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    const err = data as ApiError;
    // Map internal error messages to something user-friendly
    let message = err.message || 'Terjadi kesalahan pada server';
    
    // Hardening: Stop leaking environment variable issues to the user
    if (message.includes('JWT_SECRET') || message.includes('environment variable')) {
      message = 'Sistem sedang dalam pemeliharaan, silakan coba lagi nanti.';
    }

    throw new RequestError(
      message,
      res.status.toString(),
      err.errors
    );
  }

  // The backend wraps success in { success, message, data }
  return data.data as T;
}
