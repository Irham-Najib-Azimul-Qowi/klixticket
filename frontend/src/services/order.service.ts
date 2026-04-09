import { API_BASE_URL, handleResponse, getAuthHeaders } from '../lib/api-client';
import type { CreateOrderRequest, Order } from '../types';

export const orderService = {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    
    const parsed = await handleResponse<Order>(res);
    return parsed;
  },

  async getMyOrders(params?: { status?: string; filter?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.filter) query.set('filter', params.filter);
    const qs = query.toString() ? `?${query.toString()}` : '';
    
    const res = await fetch(`${API_BASE_URL}/orders/my${qs}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const parsed = await handleResponse<Order[]>(res);
    return parsed;
  },

  async getByID(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<Order>(res);
  }
};
