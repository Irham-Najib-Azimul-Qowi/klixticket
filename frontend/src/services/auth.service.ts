import { API_BASE_URL, getAuthHeaders, handleResponse } from '../lib/api-client';
import type { User, AuthResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async adminLogin(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<User>(res);
  },

  async updateProfile(name: string, email: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders() 
      },
      body: JSON.stringify({ name, email }),
    });
    return handleResponse<User>(res);
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getUser(): User | null {
    const u = localStorage.getItem('auth_user');
    return u ? JSON.parse(u) : null;
  },

  saveSession(token: string, user: User) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },
};
