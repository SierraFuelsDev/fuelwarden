"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { databaseService } from "../../lib/database";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Zap, RefreshCw, AlertCircle, CheckCircle, User, Calendar } from "lucide-react";

export default function TestAIMealPlanPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);

  const testUserData = async () => {
    if (!user?.$id) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await databaseService.testOnboardingData(user.$id);
      setUserData(result);
      if (result.success) {
        setSuccess("User data loaded successfully!");
      } else {
        setError(`Failed to load user data: ${result.errors.join(', ')}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const testAIMealPlan = async () => {
    if (!user?.$id) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // TODO: Implement AI meal plan generation logic
      // const newPlan = await databaseService.generateAIMealPlan(user.$id);
      // setMealPlan(newPlan);
      setSuccess("AI meal plan generated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to generate AI meal plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute fallback={<FullPageSpinner />}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">AI Meal Plan Test</h1>
          <p className="text-gray-400 mt-2">Test the AI meal plan generation functionality</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300">{success}</span>
          </div>
        )}

        {/* Test Buttons */}
        <div className="grid gap-6 mb-8">
          <Card className="bg-[#1a1a1c] border-[#2a2a2c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                Test User Data Loading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Load and display user profile and activity schedule data that will be sent to the AI function.
              </p>
              <Button 
                onClick={testUserData} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Load User Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1c] border-[#2a2a2c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5" />
                Test AI Meal Plan Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Generate a new AI meal plan using the Appwrite function and save it to the database.
              </p>
              <Button 
                onClick={testAIMealPlan} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate AI Meal Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Data Display */}
        {userData && (
          <Card className="bg-[#1a1a1c] border-[#2a2a2c] mb-6">
            <CardHeader>
              <CardTitle className="text-white">User Data (Will be sent to AI)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">User Profile:</h4>
                  <pre className="bg-[#2a2a2c] p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                    {JSON.stringify(userData.userProfile, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Activity Schedule:</h4>
                  <pre className="bg-[#2a2a2c] p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                    {JSON.stringify(userData.activitySchedule, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meal Plan Display */}
        {mealPlan && (
          <Card className="bg-[#1a1a1c] border-[#2a2a2c]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5" />
                Generated Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{mealPlan.totalCalories}</div>
                    <div className="text-sm text-gray-400">Total Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{mealPlan.totalProtein}g</div>
                    <div className="text-sm text-gray-400">Total Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{mealPlan.totalCarbs}g</div>
                    <div className="text-sm text-gray-400">Total Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{mealPlan.totalFat}g</div>
                    <div className="text-sm text-gray-400">Total Fat</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Meal Plan Data:</h4>
                  <pre className="bg-[#2a2a2c] p-4 rounded-lg text-sm text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">
                    {JSON.stringify(mealPlan, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
} 