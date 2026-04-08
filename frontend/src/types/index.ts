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

export interface OrderItem {
  id: number;
  order_id: string;
  item_type: string;
  item_name: string;
  ticket_type_id?: number | null;
  ticket_type?: TicketType | null;
  merchandise_id?: number | null;
  merchandise?: Merchandise | null;
  quantity: number;
  price_per_item: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: number;
  user?: User;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  expired_at: string;
  checked_in_at?: string | null;
  checked_in_by?: number | null;
  order_items?: OrderItem[];
  payment?: {
    checkout_url: string;
    status: string;
  };
}

export interface OrdersResponse {
  data: Order[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface DashboardSummaryResponse {
  revenue: number;
  tickets_sold: number;
  active_events: number;
}

export interface SalesChartPoint {
  date: string;
  label: string;
  revenue: number;
}

export interface CreateTicketRequest {
  name: string;
  description?: string;
  price: number;
  quota: number;
  sales_start_at: string;
  sales_end_at: string;
  active_status?: boolean;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  location: string;
  start_date: string;
  end_date: string;
  banner_url?: string | null;
  publish_status: string;
  ticket_types: CreateTicketRequest[];
}

export interface OrderItemRequest {
  ticket_type_id: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  ticket_items?: OrderItemRequest[];
  merchandise_items?: { merchandise_id: number; quantity: number }[];
  payment_method?: string;
}
