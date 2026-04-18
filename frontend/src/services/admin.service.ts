import { API_BASE_URL, handleResponse, getAuthHeaders } from '../lib/api-client';
import type { 
  DashboardSummaryResponse, 
  EventsResponse, 
  Event, 
  OrdersResponse, 
  Order, 
  CreateEventRequest,
  Merchandise,
  MerchandiseResponse,
  RedeemableItem
} from '../types';

export const adminService = {
  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
      headers: { ...getAuthHeaders() },
    });
    const data = await handleResponse<DashboardSummaryResponse>(res);
    return data;
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
    
    const events = await handleResponse<Event[]>(res);
    return { data: events || [] } as EventsResponse;
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
    const parsed = await handleResponse<Event>(res);
    return parsed;
  },

  async getEventById(id: number): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    const parsed = await handleResponse<Event | any>(res);
    return parsed?.data || parsed;
  },

  async updateEvent(id: number, data: CreateEventRequest | FormData): Promise<Event> {
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = { ...getAuthHeaders() };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    const parsed = await handleResponse<Event>(res);
    return parsed;
  },

  async deleteEvent(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    await handleResponse<any>(res);
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
    
    const orders = await handleResponse<Order[]>(res);
    return { data: orders || [] } as OrdersResponse;
  },

  // Merchandise
  async getAllMerchandise(params?: { limit?: number; offset?: number }): Promise<MerchandiseResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/merchandise${qs}`, {
      headers: { ...getAuthHeaders() },
    });
    
    const merchandise = await handleResponse<Merchandise[]>(res);
    return { data: merchandise || [] } as MerchandiseResponse;
  },

  async createMerchandise(data: FormData): Promise<Merchandise> {
    const res = await fetch(`${API_BASE_URL}/admin/merchandise`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: data,
    });
    const parsed = await handleResponse<Merchandise>(res);
    return parsed;
  },

  async updateMerchandise(id: number, data: FormData): Promise<Merchandise> {
    const res = await fetch(`${API_BASE_URL}/admin/merchandise/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders() },
      body: data,
    });
    const parsed = await handleResponse<Merchandise>(res);
    return parsed;
  },

  async getMerchById(id: number): Promise<Merchandise> {
    const res = await fetch(`${API_BASE_URL}/admin/merchandise/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    const parsed = await handleResponse<Merchandise | any>(res);
    return parsed?.data || parsed;
  },

  async deleteMerchandise(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/admin/merchandise/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    await handleResponse<any>(res);
  },

  async scanItem(code: string): Promise<RedeemableItem> {
    const res = await fetch(`${API_BASE_URL}/admin/scan`, {
      method: 'POST',
      headers: { 
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code }),
    });
    return handleResponse<RedeemableItem>(res);
  }
};
