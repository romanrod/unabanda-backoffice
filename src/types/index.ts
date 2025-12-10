// User types
export type UserRole = 'admin' | 'creator' | 'end_user';

export interface User {
  _id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  full_name?: string;
  is_active?: boolean;
}

// Event types
export type EventCategory = 'music' | 'sports' | 'conferences' | 'theater' | 'comedy' | 'other';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface EventFunction {
  id: string;
  date_time: string;
  duration_minutes: number;
  capacity: number;
  available_seats: number;
}

export interface Event {
  _id: string;
  name: string;
  description: string;
  creator_id: string;
  category: EventCategory;
  status: EventStatus;
  location: string;
  images: string[];
  functions: EventFunction[];
  created_at: string;
  updated_at: string;
}

export interface CreateEventDto {
  name: string;
  description: string;
  category: EventCategory;
  location: string;
  functions: Omit<EventFunction, 'id'>[];
  image?: File; // Event image file (required for creation)
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  category?: EventCategory;
  location?: string;
  status?: EventStatus;
  image?: File; // Event image file (optional for updates)
}

// Ticket types
export type TicketType = 'general' | 'vip' | 'early_bird' | 'student' | 'senior' | 'other';

export interface Ticket {
  _id: string;
  event_id: string;
  function_id: string;
  type: TicketType;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity_available: number;
  quantity_sold: number;
  max_per_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketDto {
  event_id: string;
  function_id: string;
  type: TicketType;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity_available: number;
  max_per_order?: number;
}

export interface UpdateTicketDto {
  type?: TicketType;
  name?: string;
  description?: string;
  price?: number;
  quantity_available?: number;
  max_per_order?: number;
  is_active?: boolean;
}

// Booking types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'stripe' | 'mercadopago';

export interface BookingTicket {
  ticket_id: string;
  ticket_name: string;
  ticket_type: TicketType;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Booking {
  _id: string;
  user_id: string;
  event_id: string;
  function_id: string;
  tickets: BookingTicket[];
  total_amount: number;
  currency: string;
  status: BookingStatus;
  payment_method: PaymentMethod;
  payment_intent_id?: string;
  payment_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthUser {
  _id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

// API Response types
export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: Booking[];
  eventsByCategory: { category: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}
