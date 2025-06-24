"use client";

import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { FullPageSpinner } from "../components/auth/LoadingSpinner";

export default function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#1c1c1e]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Fuel Your
              <span className="text-[#ff8e01]"> Journey</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Track your nutrition, plan your meals, and achieve your health goals with FuelWarden. 
              The smart way to manage your daily nutrition.
            </p>
            
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/mealLog">
                  <Button className="bg-[#ff8e01] hover:bg-[#ff9e2b] text-white px-8 py-3 text-lg">
                    Log Your Meal
                  </Button>
                </Link>
                <Link href="/mealPlan">
                  <Button 
                    variant="outline" 
                    className="border-[#ff8e01] text-[#ff8e01] hover:bg-[#ff8e01] hover:text-white px-8 py-3 text-lg"
                  >
                    Plan Meals
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <Button className="bg-[#ff8e01] hover:bg-[#ff9e2b] text-white px-8 py-3 text-lg">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    variant="outline" 
                    className="border-[#ff8e01] text-[#ff8e01] hover:bg-[#ff8e01] hover:text-white px-8 py-3 text-lg"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-[#232325]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features to help you stay on track with your nutrition goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#ff8e01] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Meal Logging</h3>
              <p className="text-gray-400">
                Easily log your daily meals and track your nutrition intake with our intuitive interface.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#ff8e01] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Meal Planning</h3>
              <p className="text-gray-400">
                Plan your weekly meals in advance and stay organized with your nutrition goals.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#ff8e01] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Progress Tracking</h3>
              <p className="text-gray-400">
                Monitor your progress with detailed analytics and insights about your nutrition journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-[#1c1c1e]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of users who are already achieving their nutrition goals with FuelWarden.
          </p>
          
          {!isAuthenticated && (
            <Link href="/auth">
              <Button className="bg-[#ff8e01] hover:bg-[#ff9e2b] text-white px-8 py-3 text-lg">
                Start Free Today
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}