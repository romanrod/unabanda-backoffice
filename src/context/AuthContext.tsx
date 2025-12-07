import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import type { AuthUser, LoginRequest } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🔐 [AUTH] AuthProvider initializing');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      console.log('🔐 [AUTH] initAuth started');
      const token = localStorage.getItem('access_token');
      console.log('🔐 [AUTH] Token found:', !!token);

      if (token) {
        try {
          console.log('🔐 [AUTH] Calling api.getCurrentUser()...');
          const currentUser = await api.getCurrentUser();
          console.log('🔐 [AUTH] Current user:', currentUser);

          // Only allow admin users
          if (currentUser.role === 'admin') {
            console.log('🔐 [AUTH] User is admin, setting user state');
            setUser(currentUser);
          } else {
            // Not an admin, logout
            console.log('🔐 [AUTH] User is not admin, clearing tokens');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } catch (error) {
          console.error('🔐 [AUTH] Failed to get current user:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      console.log('🔐 [AUTH] Setting loading to false');
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const authResponse = await api.login(credentials);
      localStorage.setItem('access_token', authResponse.access_token);
      localStorage.setItem('refresh_token', authResponse.refresh_token);

      const currentUser = await api.getCurrentUser();

      // Only allow admin users
      if (currentUser.role !== 'admin') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw new Error('Access denied. Admin privileges required.');
      }

      setUser(currentUser);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  console.log('🔐 [AUTH] AuthProvider rendering, loading:', loading, 'isAuthenticated:', !!user);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
