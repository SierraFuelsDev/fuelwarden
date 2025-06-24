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
  const router = useRouter();

  useEffect(() => {
    checkUserProfile();
  }, [user]);

  const checkUserProfile = async () => {
    if (!user?.$id) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await databaseService.getUserProfile(user.$id);
      if (profile) {
        // User already has a profile, redirect to dashboard
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome to FuelWarden!</h1>
          <p className="text-gray-400 mt-2">
            Let's get you set up to start tracking your nutrition journey
          </p>
        </div>
        
        <OnboardingForm onComplete={handleOnboardingComplete} />
      </div>
    </ProtectedRoute>
  );
} 