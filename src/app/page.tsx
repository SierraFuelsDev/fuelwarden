"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullPageSpinner } from "../components/auth/LoadingSpinner";
import { databaseService } from "../lib/database";

export default function HomePage() {
  const { user, isAuthenticated, loading, handleOAuthCallback } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleAuthFlow = async () => {
      if (!loading) {
        if (isAuthenticated && user) {
          try {
            // Check if user has completed onboarding
            const profile = await databaseService.getUserProfile(user.$id);
            if (profile) {
              // User has completed onboarding, go to dashboard
              router.replace("/dashboard");
            } else {
              // User needs to complete onboarding
              router.replace("/onboarding");
            }
          } catch (error) {
            console.error("Error checking user profile:", error);
            // If there's an error checking profile, assume user needs onboarding
            router.replace("/onboarding");
          }
        } else {
          // Check if this is an OAuth callback (URL has auth params)
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('success') || urlParams.has('userId') || urlParams.has('sessionId')) {
            // This is an OAuth callback, handle it
            await handleOAuthCallback();
          } else {
            router.replace("/auth");
          }
        }
      }
    };

    handleAuthFlow();
  }, [isAuthenticated, loading, router, user, handleOAuthCallback]);

  if (loading) {
    return <FullPageSpinner />;
  }

  // This should not render as we're redirecting, but just in case
  return <FullPageSpinner />;
}