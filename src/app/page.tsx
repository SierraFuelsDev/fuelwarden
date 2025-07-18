"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullPageSpinner } from "../components/auth/LoadingSpinner";

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/auth");
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <FullPageSpinner />;
  }

  // This should not render as we're redirecting, but just in case
  return <FullPageSpinner />;
}