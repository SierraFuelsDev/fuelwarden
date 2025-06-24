"use client";

import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";

export default function MealLogPage() {
  return (
    <ProtectedRoute fallback={<FullPageSpinner />}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Meal Log</h1>
          <p className="text-gray-400 mt-2">Track your daily nutrition and meals</p>
        </div>
        
        <div className="bg-[#232325] rounded-lg border border-[#333] p-6">
          <p className="text-gray-300">Meal logging functionality coming soon...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 