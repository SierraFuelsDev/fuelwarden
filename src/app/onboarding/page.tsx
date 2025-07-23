"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { OnboardingForm } from "../../components/onboarding/OnboardingForm";
import { databaseService } from "../../lib/database";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("[OnboardingPage] useEffect triggered", { user, isOnboarding });
    // Don't check profile if onboarding is in progress
    if (isOnboarding) {
      return;
    }
    checkUserProfile();
  }, [user, isOnboarding]);

  const checkUserProfile = async () => {
    if (!user?.$id) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await databaseService.getUserProfile(user.$id);
      if (profile) {
        console.log("[OnboardingPage] Profile found, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboarding(false);
    setHasProfile(true);
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (hasProfile === true) {
    return <FullPageSpinner />;
  }

  return (
    <ProtectedRoute fallback={<FullPageSpinner />}>
      <OnboardingForm onComplete={handleOnboardingComplete} setIsOnboarding={setIsOnboarding} />
    </ProtectedRoute>
  );
} 