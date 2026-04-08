import { API_BASE_URL, handleResponse, getAuthHeaders } from '../lib/api-client';
import type { 
  DashboardSummaryResponse, 
  EventsResponse, 
  Event, 
  OrdersResponse, 
  Order, 
  CreateEventRequest 
} from '../types';

export const adminService = {
  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await handleResponse<any>(res);
    return data.data as DashboardSummaryResponse;
  },

  // Events
  async getAllEvents(params?: { limit?: number; offset?: number }): Promise<EventsResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/events${qs}`, {
      headers: { ...getAuthHeaders() },
    });
    
    const response = await handleResponse<any>(res);
    return { data: response.data || [] } as EventsResponse;
  },

  async createEvent(data: CreateEventRequest | FormData): Promise<Event> {
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = { ...getAuthHeaders() };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}/admin/events`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    const parsed = await handleResponse<any>(res);
    return parsed.data as Event;
  },

  // Orders
  async getAllOrders(params?: { limit?: number; offset?: number; status?: string }): Promise<OrdersResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);
    
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/orders${qs}`, {
      headers: { ...getAuthHeaders() },
    });
    
    const response = await handleResponse<any>(res);
    return { data: response.data || [] } as OrdersResponse;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    const response = await handleResponse<any>(res);
    return response.data as Order;
  }
};
