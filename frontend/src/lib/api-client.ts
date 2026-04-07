import type { ApiError } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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

export async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const err = data as ApiError;
    throw new RequestError(
      err.message || 'Terjadi kesalahan pada server',
      res.status.toString(),
      err.errors
    );
  }
  // The backend wraps success in { status, message, data }
  return data.data as T;
}
