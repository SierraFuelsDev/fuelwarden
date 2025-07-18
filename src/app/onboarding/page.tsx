"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { OnboardingForm } from "../../components/onboarding/OnboardingForm";
import { databaseService } from "../../lib/database";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-[#ff8e01] to-[#ff9e2b] mr-3 sm:mr-4">
                <Sparkles size={24} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Welcome to FuelWarden!
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Let's get you set up with a personalized nutrition plan that matches your goals and lifestyle
            </p>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[#ff8e01] rounded-full mr-2"></div>
                <span>Quick setup</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[#ff8e01] rounded-full mr-2"></div>
                <span>Personalized plans</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[#ff8e01] rounded-full mr-2"></div>
                <span>AI-powered recommendations</span>
              </div>
            </div>
          </div>
          
          {/* Onboarding Form */}
          <div className="w-full">
            <OnboardingForm onComplete={handleOnboardingComplete} setIsOnboarding={setIsOnboarding} />
          </div>
          
          {/* Footer */}
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-gray-500 text-sm px-4">
              Your data is secure and will only be used to create personalized meal plans
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 