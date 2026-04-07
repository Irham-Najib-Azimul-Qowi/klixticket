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

export interface EventsResponse {
  data: Event[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface MerchandiseResponse {
  data: Merchandise[];
  total?: number;
}
