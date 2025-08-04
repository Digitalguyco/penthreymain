'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, User, isAuthenticated, RegisterData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Check if user is authenticated and fetch profile on mount
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          const response = await apiClient.getProfile();
          if (response.data) {
            setUser(response.data);
            console.log('User profile fetched successfully:', response.data);
          } else if (response.error) {
            console.error('Failed to fetch user profile:', response.error);
            // Clear invalid tokens
            await logout();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          await logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.login(email, password);
      if (response.data) {
        const { user } = response.data;
        setUser(user);
        setLoading(false);
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorData = (error as { response?: { data?: { code?: string; error?: string } } })?.response?.data;
      
      if (errorData?.code === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email address before logging in. Check your email for verification instructions.');
      } else {
        setError(errorData?.error || 'Login failed');
      }
      
      setLoading(false);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.register(data);
      
      if (response.data) {
        setUser(response.data.user);
        return true;
      } else if (response.error) {
        setError(response.error);
        return false;
      }
      
      return false;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const updateUser = async (data: Partial<User>): Promise<boolean> => {
    try {
      setError(null);

      const response = await apiClient.updateProfile(data);
      
      if (response.data) {
        setUser(response.data);
        return true;
      } else if (response.error) {
        setError(response.error);
        return false;
      }
      
      return false;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed');
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiClient.getProfile();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
}
