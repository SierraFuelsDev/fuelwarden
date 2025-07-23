"use client";

import { useState, useEffect } from "react";
import { AuthForm } from "../../components/auth/AuthForm";
import { PublicRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');

  // Check URL parameters for mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam === 'signin' || modeParam === 'signup') {
      setMode(modeParam);
    }
  }, []);

  return (
    <PublicRoute fallback={<FullPageSpinner />}>
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="w-full max-w-sm mx-4">
          <AuthForm mode={mode} onModeChange={setMode} />
        </div>
      </div>
    </PublicRoute>
  );
} 