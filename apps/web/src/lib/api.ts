const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//api.${window.location.hostname}` : 'http://localhost:3000');

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Get auth tokens from zustand persisted store
function getAuthTokens() {
  if (typeof window === 'undefined') return { token: null, refreshToken: null };
  try {
    const stored = localStorage.getItem('naploo-auth');
    if (!stored) return { token: null, refreshToken: null };
    const parsed = JSON.parse(stored);
    return {
      token: parsed?.state?.token || null,
      refreshToken: parsed?.state?.refreshToken || null,
    };
  } catch {
    return { token: null, refreshToken: null };
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { token } = getAuthTokens();
  
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
      // If token expired, try to refresh
      if (response.status === 401 && token) {
        const refreshResult = await tryRefreshToken();
        if (refreshResult) {
          // Retry the original request with new token
          const retryHeaders: HeadersInit = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshResult}`,
            ...options.headers,
          };
          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: retryHeaders,
          });
          const retryData = await retryResponse.json();
          if (retryResponse.ok) {
            return { data: retryData, status: retryResponse.status };
          }
        }
      }

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

// Try to refresh the access token
async function tryRefreshToken(): Promise<string | null> {
  const { refreshToken } = getAuthTokens();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.success && data.accessToken) {
      // Update the zustand store via localStorage
      try {
        const stored = localStorage.getItem('naploo-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.state.token = data.accessToken;
          if (data.user) {
            parsed.state.user = data.user;
          }
          localStorage.setItem('naploo-auth', JSON.stringify(parsed));
        }
      } catch {}
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
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
  login: (email: string, password: string) =>
    api.post<{
      success: boolean;
      message: string;
      user: { id: string; phone: string; email: string | null; firstName: string | null; lastName: string | null; role: string; status: string };
      accessToken: string;
      refreshToken: string;
    }>('/api/v1/auth/login', { email, password }),
  sendOtp: (phone: string) => api.post<{ success: boolean; message: string; otp?: string }>('/api/v1/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string, name?: string, email?: string) =>
    api.post<{
      success: boolean;
      message: string;
      isNewUser: boolean;
      user: {
        id: string;
        phone: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        role: string;
        status: string;
      };
      accessToken: string;
      refreshToken: string;
    }>('/api/v1/auth/verify-otp', { phone, otp, name, email }),
  refreshToken: (refreshToken: string) =>
    api.post<{ success: boolean; accessToken: string }>('/api/v1/auth/refresh', { refreshToken }),
  getMe: () =>
    api.get<{
      success: boolean;
      user: {
        id: string;
        phone: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        role: string;
        status: string;
        city: string | null;
        state: string | null;
        phoneVerified: boolean;
        emailVerified: boolean;
        createdAt: string;
      };
    }>('/api/v1/auth/me'),
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    city?: string;
    state?: string;
    address?: string;
    pincode?: string;
  }) => api.patch<{ success: boolean; message: string; user: unknown }>('/api/v1/auth/profile', data),
  logout: (refreshToken?: string) => api.post('/api/v1/auth/logout', { refreshToken }),
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
