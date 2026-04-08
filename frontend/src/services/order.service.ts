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

  async getMyOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE_URL}/orders/my`, {
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
