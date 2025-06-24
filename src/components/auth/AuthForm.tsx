"use client";

import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../lib/auth';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function AuthForm({ mode, onSuccess, onError }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, error: authError, clearError } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup' && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      
      onSuccess?.();
    } catch (error: any) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    clearError();

    try {
      await authService.createOAuthSession(
        'google',
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/auth?error=oauth`
      );
    } catch (error: any) {
      onError?.(error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="mt-2 text-gray-400">
          {mode === 'signin' 
            ? 'Sign in to your account to continue' 
            : 'Sign up to get started with FuelWarden'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <Label htmlFor="name" className="text-white">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="mt-1 bg-[#1c1c1e] border border-[#444] text-white placeholder-gray-400 focus:border-[#ff8e01] focus:ring-[#ff8e01]"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-1 bg-[#1c1c1e] border border-[#444] text-white placeholder-gray-400 focus:border-[#ff8e01] focus:ring-[#ff8e01]"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className="text-white">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 bg-[#1c1c1e] border border-[#444] text-white placeholder-gray-400 focus:border-[#ff8e01] focus:ring-[#ff8e01]"
            disabled={loading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {authError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{authError.message}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#ff8e01] hover:bg-[#ff9e2b] text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
            </div>
          ) : (
            mode === 'signin' ? 'Sign In' : 'Create Account'
          )}
        </Button>
      </form>

      <Separator className="bg-[#333]" />

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-3 border border-[#ff8e01] text-[#ff8e01] hover:bg-[#ff8e01] hover:text-white transition-colors duration-200 font-semibold py-3 rounded-lg shadow-md"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_17_40)">
            <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.02h13.02c-.56 3.02-2.24 5.58-4.78 7.3v6.06h7.74c4.54-4.18 7.07-10.34 7.07-17.676z" fill="#4285F4"/>
            <path d="M24.48 48c6.48 0 11.92-2.14 15.89-5.82l-7.74-6.06c-2.14 1.44-4.88 2.3-8.15 2.3-6.26 0-11.56-4.22-13.46-9.9H2.5v6.22C6.47 43.78 14.7 48 24.48 48z" fill="#34A853"/>
            <path d="M11.02 28.52c-.48-1.44-.76-2.98-.76-4.52s.28-3.08.76-4.52v-6.22H2.5A23.98 23.98 0 000 24c0 3.98.96 7.76 2.5 11.22l8.52-6.7z" fill="#FBBC05"/>
            <path d="M24.48 9.5c3.52 0 6.66 1.22 9.14 3.62l6.84-6.84C36.4 2.14 30.96 0 24.48 0 14.7 0 6.47 4.22 2.5 10.78l8.52 6.7c1.9-5.68 7.2-9.98 13.46-9.98z" fill="#EA4335"/>
          </g>
          <defs>
            <clipPath id="clip0_17_40">
              <rect width="48" height="48" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        Continue with Google
      </Button>
    </div>
  );
} 