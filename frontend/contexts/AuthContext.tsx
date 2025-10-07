// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginRequest, RegisterRequest } from '@/types';
import AuthService from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  wizzardStep: number;
  setWizardStep: React.Dispatch<React.SetStateAction<number>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wizzardStep, setWizardStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Setup axios interceptors
    AuthService.setupAxiosInterceptors();
    
    // Load user from storage on mount
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = () => {
    try {
      const storedUser = AuthService.getUser();
      const token = AuthService.getAccessToken();
      
      if (storedUser && token && !AuthService.isTokenExpired(token)) {
        setUser(storedUser);
      } else {
        console.log('User not authenticated, clearing data');
        // Clear invalid data
        AuthService.logout();
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const tokens = await AuthService.login(credentials.email, credentials.password);
      setUser(tokens.user);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const tokens = await AuthService.register(userData);
      setUser(tokens.user);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      // Even if logout fails on server, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      AuthService.setUser(currentUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      // If refresh fails, logout
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    wizzardStep,
    setWizardStep,
    currentStep, 
    setCurrentStep
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
