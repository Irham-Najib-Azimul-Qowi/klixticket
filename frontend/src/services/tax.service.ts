import { apiClient } from '../lib/api-client';
import { Tax } from '../types';

export const taxService = {
  // Public
  getActiveTaxes: async (): Promise<Tax[]> => {
    const res = await apiClient.get('/taxes');
    return res.data;
  },

  // Admin
  getAllTaxes: async (): Promise<Tax[]> => {
    const res = await apiClient.get('/admin/taxes');
    return res.data;
  },

  createTax: async (data: { name: string; percentage: number; active_status: boolean }): Promise<Tax> => {
    const res = await apiClient.post('/admin/taxes', data);
    return res.data;
  },

  updateTax: async (id: number, data: { name?: string; percentage?: number; active_status?: boolean }): Promise<Tax> => {
    const res = await apiClient.put(`/admin/taxes/${id}`, data);
    return res.data;
  },

  deleteTax: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/taxes/${id}`);
  },
};
