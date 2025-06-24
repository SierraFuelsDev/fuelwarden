"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthUser, AuthError } from '../lib/auth';
import { databaseService } from '../lib/database';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  checkOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        await checkOnboardingStatus();
      }
    } catch (err) {
      console.error('Failed to initialize auth:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkOnboardingStatus = async () => {
    if (!user?.$id) return;
    
    try {
      const profile = await databaseService.getUserProfile(user.$id);
      setHasCompletedOnboarding(!!profile);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signIn(email, password);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      // Check if user has completed onboarding
      if (currentUser) {
        await checkOnboardingStatus();
        if (hasCompletedOnboarding) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const newUser = await authService.signUp(email, password, name);
      setUser(newUser);
      setHasCompletedOnboarding(false);
      
      // Redirect to onboarding for new users
      router.push('/onboarding');
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signOut();
      setUser(null);
      setHasCompletedOnboarding(false);
      
      // Redirect to auth page
      router.push('/auth');
    } catch (err: any) {
      setError(err);
      // Even if signout fails, clear user state
      setUser(null);
      setHasCompletedOnboarding(false);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
    isAuthenticated: !!user,
    hasCompletedOnboarding,
    checkOnboardingStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 