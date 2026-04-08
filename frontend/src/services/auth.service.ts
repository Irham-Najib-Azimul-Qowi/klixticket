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

  async forgotPassword(email: string): Promise<{ debug_token?: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ debug_token?: string }>(res);
  },

  async resetPassword(data: any): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async googleLogin(idToken: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
    });
    return handleResponse<AuthResponse>(res);
  },

  async changePassword(data: any): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/users/me/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders() 
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
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
    if (!u || u === 'undefined') return null;
    try {
      return JSON.parse(u);
    } catch (e) {
      console.error('Failed to parse auth_user', e);
      return null;
    }
  },

  saveSession(token: string, user: any) {
    if (!token || !user) return;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },
};
