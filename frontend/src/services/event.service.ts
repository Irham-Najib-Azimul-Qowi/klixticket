import { API_BASE_URL, handleResponse } from '../lib/api-client';
import type { Event, EventsResponse } from '../types';

export const eventService = {
  async getPublished(params?: { page?: number; limit?: number }): Promise<EventsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/events${qs}`);
    return handleResponse<EventsResponse>(res);
  },

  async getBySlug(slug: string): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/events/${slug}`);
    return handleResponse<Event>(res);
  },

  async getPublishedByID(id: string): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/events/${id}`);
    return handleResponse<Event>(res);
  },

  async getNearestEvent(): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/events/nearest`);
    return handleResponse<Event>(res);
  },
};
