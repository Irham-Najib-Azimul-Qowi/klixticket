import { API_BASE_URL, getAuthHeaders, handleResponse } from '../lib/api-client';
import type { Tax } from '../types';

export const taxService = {
  // Public
  getActiveTaxes: async (): Promise<Tax[]> => {
    const res = await fetch(`${API_BASE_URL}/taxes`);
    return handleResponse<Tax[]>(res);
  },

  // Admin
  getAllTaxes: async (): Promise<Tax[]> => {
    const res = await fetch(`${API_BASE_URL}/admin/taxes`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<Tax[]>(res);
  },

  createTax: async (data: { name: string; percentage: number; active_status: boolean }): Promise<Tax> => {
    const res = await fetch(`${API_BASE_URL}/admin/taxes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders() 
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Tax>(res);
  },

  updateTax: async (id: number, data: { name?: string; percentage?: number; active_status?: boolean }): Promise<Tax> => {
    const res = await fetch(`${API_BASE_URL}/admin/taxes/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders() 
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Tax>(res);
  },

  deleteTax: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/admin/taxes/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<void>(res);
  },
};
