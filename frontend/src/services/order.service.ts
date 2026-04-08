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
  }
};
