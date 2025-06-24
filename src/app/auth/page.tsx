"use client";

import { useState } from "react";
import { AuthForm } from "../../components/auth/AuthForm";
import { PublicRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <PublicRoute fallback={<FullPageSpinner />}>
      <div className="flex min-h-screen items-center justify-center bg-[#1c1c1e] px-4">
        <div className="w-full max-w-md">
          <AuthForm mode={mode} />
          
          <div className="mt-6 text-center">
            {mode === 'signin' ? (
              <span className="text-sm text-gray-400">
                {"Don't have an account? "}
                <button
                  className="text-[#ff8e01] font-semibold hover:underline"
                  onClick={() => setMode('signup')}
                >
                  Sign up.
                </button>
              </span>
            ) : (
              <span className="text-sm text-gray-400">
                {"Already have an account? "}
                <button
                  className="text-[#ff8e01] font-semibold hover:underline"
                  onClick={() => setMode('signin')}
                >
                  Sign in.
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </PublicRoute>
  );
} 