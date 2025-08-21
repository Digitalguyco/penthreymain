// API configuration and utility functions for interacting with Django backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// API response types
export interface ApiResponse<T = never> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number?: string;
  profile_picture?: string;
  role: 'admin' | 'manager' | 'staff';
  organization_name?: string;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  email: string;
  phone_number?: string;
  website?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  organization_type: string;
  industry?: string;
  employee_count: number;
  subscription_plan: 'free' | 'standard' | 'premium' | 'enterprise';
  logo?: string;
  currency: string;
  timezone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user_count: number;
  full_address: string;
  subscription_limits: {
    users: number;
    storage_gb: number;
    features: string[];
  };
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  password: string;
  password_confirm: string;
  organization_name?: string;
  organization_invite_token?: string;
}

// Token management
class TokenManager {
  private static instance: TokenManager;
  
  private constructor() {}
  
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }
  
  setTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
    }
  }
  
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }
  
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }
  
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
  
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const tokenManager = TokenManager.getInstance();

// API client class
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = tokenManager.getAccessToken();
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });
  
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle token refresh for 401 errors
        if (response.status === 401 && token) {
          const refreshSuccess = await this.refreshToken();
          if (refreshSuccess) {
            // Retry the request with new token
            return this.makeRequest(endpoint, options);
          } else {
            // Refresh failed, redirect to login
            tokenManager.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
        
        return {
          error: data.detail || data.error || 'An error occurred',
          errors: data.errors,
        };
      }
      
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
  
  private async refreshToken(): Promise<boolean> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;
    
    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        tokenManager.setTokens({ 
          access: data.access, 
          refresh: refreshToken 
        });
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    return false;
  }
  
  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.makeRequest<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log(response.error)
    if (response.error) {
      return { error: response.error };
    }
    // set tokens
    if (response.data) {
      tokenManager.setTokens({ 
        access: response.data.tokens.access, 
        refresh: response.data.tokens.refresh 
      });
    }
    return response;
  }
  
  async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async logout(): Promise<ApiResponse<{ message?: string }>> {
    const refreshToken = tokenManager.getRefreshToken();
    const response = await this.makeRequest<{ message?: string }>('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    tokenManager.clearTokens();
    return response;
  }
  
  async getProfile(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/profile/');
  }

  // Password reset endpoints
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string; reset_token?: string }>> {
    return this.makeRequest<{ message: string; reset_token?: string }>('/auth/password/reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async confirmPasswordReset(token: string, newPassword: string, newPasswordConfirm: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/auth/password/reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({ 
        token, 
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm
      }),
    });
  }

  // Email verification endpoints
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/auth/email/verify/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
  
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  
  async getDashboard(): Promise<ApiResponse> {
    return this.makeRequest('/auth/dashboard/');
  }
  
  // Organization endpoints
  async getOrganization(): Promise<ApiResponse<Organization>> {
    return this.makeRequest<Organization>('/organizations/');
  }
  
  async updateOrganization(data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return this.makeRequest<Organization>('/organizations/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  
  async createOrganization(data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return this.makeRequest<Organization>('/organizations/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async getOrganizationMembers(): Promise<ApiResponse<User[]>> {
    return this.makeRequest<User[]>('/organizations/members/');
  }
  
  async inviteUser(email: string, role: string): Promise<ApiResponse> {
    return this.makeRequest('/organizations/invites/send/', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }
  
  async getOrganizationStats(): Promise<ApiResponse> {
    return this.makeRequest('/organizations/stats/');
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Utility functions
export const isAuthenticated = (): boolean => {
  return tokenManager.isAuthenticated();
};

export const getAuthToken = (): string | null => {
  return tokenManager.getAccessToken();
};

export const clearAuth = (): void => {
  tokenManager.clearTokens();
};
