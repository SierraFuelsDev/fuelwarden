"use client";

import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">{fallback}</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  redirectTo = '/onboarding'
}: PublicRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">{fallback}</div>;
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
} 