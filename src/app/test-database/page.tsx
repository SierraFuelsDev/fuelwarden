"use client";

import { useState } from "react";
import { databaseService } from "@/lib/database";
import { useUser } from "@/app/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestDatabasePage() {
  const { user } = useUser();
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testDatabaseOperations = async () => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    setIsLoading(true);
    try {
      console.log("[Test] Starting database test for user:", user.$id);

      // Test 1: Create a sample user profile
      const sampleProfile = {
        userId: user.$id,
        age: 25,
        sex: "male" as const,
        weightPounds: 180,
        heightInches: 72,
        restrictions: ["gluten"],
        performanceObjective: "in-season-peak",
        trainingCompetition: ["basketball"],
        diet: ["high-protein"]
      };

      console.log("[Test] Creating sample profile:", sampleProfile);
      const createdProfile = await databaseService.createUserProfile(sampleProfile);
      console.log("[Test] Profile created:", createdProfile);

      // Test 2: Create a sample activity schedule
      const sampleActivities = [
        {
          dayOfWeek: "Monday" as const,
          timeOfDay: "morning" as const,
          activity: "Lift",
          intensity: "moderate" as const,
          durationMinutes: 60,
          notes: "Focus on legs"
        },
        {
          dayOfWeek: "Wednesday" as const,
          timeOfDay: "afternoon" as const,
          activity: "Cardio",
          intensity: "intense" as const,
          durationMinutes: 45,
          notes: "HIIT training"
        }
      ];

      const sampleSchedule = {
        userId: user.$id,
        activities: sampleActivities
      };

      console.log("[Test] Creating sample activity schedule:", sampleSchedule);
      const createdSchedule = await databaseService.createActivitySchedule(sampleSchedule);
      console.log("[Test] Activity schedule created:", createdSchedule);

      // Test 3: Retrieve and verify the data
      console.log("[Test] Testing data retrieval...");
      const verificationResult = await databaseService.testOnboardingData(user.$id);
      console.log("[Test] Verification result:", verificationResult);

      setTestResult({
        profile: createdProfile,
        activitySchedule: createdSchedule,
        verification: verificationResult,
        success: verificationResult.success
      });

    } catch (error: any) {
      console.error("[Test] Database test failed:", error);
      setTestResult({
        error: error.message,
        success: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearTestData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get existing data
      const profile = await databaseService.getUserProfile(user.$id);
      const schedule = await databaseService.getActivitySchedule(user.$id);

      // Delete if exists
      if (profile) {
        await databaseService.deleteUserProfile(profile.$id!);
        console.log("[Test] Profile deleted");
      }

      if (schedule) {
        await databaseService.deleteActivitySchedule(schedule.$id!);
        console.log("[Test] Activity schedule deleted");
      }

      setTestResult({ message: "Test data cleared", success: true });
    } catch (error: any) {
      console.error("[Test] Failed to clear test data:", error);
      setTestResult({ error: error.message, success: false });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Test</CardTitle>
            <CardDescription>Please log in to test the database</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Test Page</CardTitle>
          <CardDescription>
            Test database operations for user: {user.$id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button 
              onClick={testDatabaseOperations} 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Testing..." : "Test Database Operations"}
            </Button>
            <Button 
              onClick={clearTestData} 
              disabled={isLoading}
              variant="outline"
            >
              Clear Test Data
            </Button>
          </div>

          {testResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Test Results: {testResult.success ? "✅ Success" : "❌ Failed"}
              </h3>
              
              {testResult.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-800">Error:</h4>
                  <p className="text-red-700">{testResult.error}</p>
                </div>
              )}

              {testResult.message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-700">{testResult.message}</p>
                </div>
              )}

              {testResult.profile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800">Profile Created:</h4>
                  <pre className="text-sm text-blue-700 overflow-auto">
                    {JSON.stringify(testResult.profile, null, 2)}
                  </pre>
                </div>
              )}

              {testResult.activitySchedule && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-purple-800">Activity Schedule Created:</h4>
                  <pre className="text-sm text-purple-700 overflow-auto">
                    {JSON.stringify(testResult.activitySchedule, null, 2)}
                  </pre>
                </div>
              )}

              {testResult.verification && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">Verification Results:</h4>
                  <pre className="text-sm text-gray-700 overflow-auto">
                    {JSON.stringify(testResult.verification, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 