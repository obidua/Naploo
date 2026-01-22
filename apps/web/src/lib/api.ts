const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'Something went wrong',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: 'Network error. Please try again.',
      status: 0,
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

// Auth API
export const authApi = {
  sendOtp: (phone: string) => api.post('/api/v1/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string) =>
    api.post<{ token: string; refreshToken: string; user: unknown }>(
      '/api/v1/auth/verify-otp',
      { phone, otp }
    ),
  refreshToken: (refreshToken: string) =>
    api.post<{ token: string }>('/api/v1/auth/refresh', { refreshToken }),
  logout: () => api.post('/api/v1/auth/logout', {}),
};

// Pods API
export const podsApi = {
  search: (params: {
    location?: string;
    lat?: number;
    lng?: number;
    date?: string;
    duration?: number;
  }) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return api.get(`/api/v1/pods/search?${query}`);
  },
  getById: (id: string) => api.get(`/api/v1/pods/${id}`),
  getAvailability: (id: string, date: string) =>
    api.get(`/api/v1/pods/${id}/availability?date=${date}`),
};

// Bookings API
export const bookingsApi = {
  create: (data: {
    podId: string;
    startTime: string;
    duration: number;
  }) => api.post('/api/v1/bookings', data),
  getMyBookings: () => api.get('/api/v1/bookings/my'),
  getById: (id: string) => api.get(`/api/v1/bookings/${id}`),
  cancel: (id: string) => api.patch(`/api/v1/bookings/${id}/cancel`, {}),
};

export default api;
