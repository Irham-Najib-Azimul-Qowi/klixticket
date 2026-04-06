// Frontend API configuration
// Uses VITE_API_URL env var or defaults to localhost:8080
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketType {
  id: number;
  event_id: number;
  name: string;
  description: string;
  price: number;
  quota: number;
  remaining_quota: number;
  sales_start_at: string;
  sales_end_at: string;
  active_status: boolean;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  banner_url: string | null;
  publish_status: string;
  ticket_types?: TicketType[];
  created_at: string;
  updated_at: string;
}

export interface Merchandise {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

export interface AuthResponse {
  token: string;
  role: string;
  user: User;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: Record<string, string>;
}

export class RequestError extends Error {
  status: string;
  errors?: Record<string, string>;

  constructor(message: string, status: string, errors?: Record<string, string>) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
    this.errors = errors;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const err = data as ApiError;
    throw new RequestError(
      err.message || 'Terjadi kesalahan pada server',
      res.status.toString(),
      err.errors
    );
  }
  // The backend wraps success in { status, message, data }
  return data.data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
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

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getUser(): User | null {
    const u = localStorage.getItem('auth_user');
    return u ? JSON.parse(u) : null;
  },

  saveSession(token: string, user: User) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },
};

// ─── Events API ───────────────────────────────────────────────────────────────

export interface EventsResponse {
  data: Event[];
  total?: number;
  page?: number;
  limit?: number;
}

export const eventsApi = {
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

  async getByID(id: number): Promise<Event> {
    const res = await fetch(`${API_BASE_URL}/events/${id}`);
    return handleResponse<Event>(res);
  },
};

// ─── Merchandise API ──────────────────────────────────────────────────────────

export interface MerchandiseResponse {
  data: Merchandise[];
  total?: number;
}

export const merchandiseApi = {
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
