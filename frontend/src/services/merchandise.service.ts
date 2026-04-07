import { API_BASE_URL, handleResponse } from '../lib/api-client';
import type { Merchandise, MerchandiseResponse } from '../types';

export const merchandiseService = {
  async getPublic(): Promise<MerchandiseResponse> {
    const res = await fetch(`${API_BASE_URL}/merchandise`);
    return handleResponse<MerchandiseResponse>(res);
  },

  async getBySlug(slug: string): Promise<Merchandise> {
    const res = await fetch(`${API_BASE_URL}/merchandise/${slug}`);
    return handleResponse<Merchandise>(res);
  },

  async getByID(id: number): Promise<Merchandise> {
    const res = await fetch(`${API_BASE_URL}/merchandise/${id}`);
    return handleResponse<Merchandise>(res);
  },
};
