import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  Event,
  CreateEventDto,
  UpdateEventDto,
  Ticket,
  CreateTicketDto,
  UpdateTicketDto,
  Booking,
  LoginRequest,
  AuthResponse,
  AuthUser,
  DashboardStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                refresh_token: refreshToken,
              });
              const { access_token } = response.data;
              localStorage.setItem('access_token', access_token);

              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${access_token}`;
                return this.client.request(error.config);
              }
            } catch {
              // Refresh failed, logout
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
            }
          } else {
            // No refresh token, logout
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.client.post<AuthResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await this.client.get<AuthUser>('/api/auth/me');
    return response.data;
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>('/api/users/');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.client.get<User>(`/api/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await this.client.post<User>('/api/auth/register', data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await this.client.put<User>(`/api/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/api/users/${id}`);
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const response = await this.client.put<User>(`/api/users/${id}/role`, { role });
    return response.data;
  }

  // Event endpoints
  async getEvents(): Promise<Event[]> {
    const response = await this.client.get<Event[]>('/api/events/');
    return response.data;
  }

  async getAllEventsAdmin(): Promise<Event[]> {
    // For admin, we might need a different endpoint or query param
    const response = await this.client.get<Event[]>('/api/events/', {
      params: { all: true },
    });
    return response.data;
  }

  async getEvent(id: string): Promise<Event> {
    const response = await this.client.get<Event>(`/api/events/${id}`);
    return response.data;
  }

  async createEvent(data: CreateEventDto): Promise<Event> {
    const response = await this.client.post<Event>('/api/events/', data);
    return response.data;
  }

  async updateEvent(id: string, data: UpdateEventDto): Promise<Event> {
    const response = await this.client.put<Event>(`/api/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.client.delete(`/api/events/${id}`);
  }

  async publishEvent(id: string): Promise<Event> {
    const response = await this.client.post<Event>(`/api/events/${id}/publish`);
    return response.data;
  }

  // Ticket endpoints
  async getTickets(eventId?: string): Promise<Ticket[]> {
    if (eventId) {
      const response = await this.client.get<Ticket[]>(`/api/tickets/event/${eventId}`);
      return response.data;
    }
    // Get all tickets (might need a custom endpoint)
    const response = await this.client.get<Ticket[]>('/api/tickets/');
    return response.data;
  }

  async getTicket(id: string): Promise<Ticket> {
    const response = await this.client.get<Ticket>(`/api/tickets/${id}`);
    return response.data;
  }

  async createTicket(data: CreateTicketDto): Promise<Ticket> {
    const response = await this.client.post<Ticket>('/api/tickets/', data);
    return response.data;
  }

  async updateTicket(id: string, data: UpdateTicketDto): Promise<Ticket> {
    const response = await this.client.put<Ticket>(`/api/tickets/${id}`, data);
    return response.data;
  }

  async deleteTicket(id: string): Promise<void> {
    await this.client.delete(`/api/tickets/${id}`);
  }

  // Booking endpoints
  async getBookings(): Promise<Booking[]> {
    // For admin, get all bookings (might need custom endpoint)
    const response = await this.client.get<Booking[]>('/api/bookings/');
    return response.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.client.get<Booking>(`/api/bookings/${id}`);
    return response.data;
  }

  async getEventBookings(eventId: string): Promise<Booking[]> {
    const response = await this.client.get<Booking[]>(`/api/bookings/event/${eventId}`);
    return response.data;
  }

  async cancelBooking(id: string): Promise<Booking> {
    const response = await this.client.post<Booking>(`/api/bookings/${id}/cancel`);
    return response.data;
  }

  // Dashboard/Analytics endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    // This might need a custom endpoint on the backend
    // For now, we'll aggregate data from multiple endpoints
    const [users, events, bookings] = await Promise.all([
      this.getUsers(),
      this.getAllEventsAdmin(),
      this.getBookings(),
    ]);

    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.total_amount, 0);

    const eventsByCategory = events.reduce((acc, event) => {
      const existing = acc.find(item => item.category === event.category);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ category: event.category, count: 1 });
      }
      return acc;
    }, [] as { category: string; count: number }[]);

    const recentBookings = bookings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    // Revenue by month (simplified)
    const revenueByMonth = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((acc, booking) => {
        const month = new Date(booking.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short'
        });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.revenue += booking.total_amount;
        } else {
          acc.push({ month, revenue: booking.total_amount });
        }
        return acc;
      }, [] as { month: string; revenue: number }[]);

    return {
      totalUsers: users.length,
      totalEvents: events.length,
      totalBookings: bookings.length,
      totalRevenue,
      recentBookings,
      eventsByCategory,
      revenueByMonth,
    };
  }
}

export const api = new ApiClient();
