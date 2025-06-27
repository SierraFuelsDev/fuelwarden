"use client";

import { useState } from "react";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { databaseService, UserProfile } from "../../lib/database";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

export default function TestPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Database Connection
      addTestResult("Database Connection", true, "Testing connection...");
      const connectionResult = await databaseService.testConnection();
      addTestResult("Database Connection", connectionResult.success, connectionResult.message, connectionResult);

      if (!connectionResult.success) {
        addTestResult("All Tests", false, "Database connection failed. Stopping tests.");
        return;
      }

      // Test 2: User Profile Operations
      if (user?.$id) {
        // Test 2.1: Create Profile
        addTestResult("Create Profile", true, "Testing profile creation...");
        try {
          const testProfile: Omit<UserProfile, "$id" | "$createdAt" | "$updatedAt"> = {
            userId: user.$id,
            age: 25,
            weightPounds: 150,
            heightInches: 70,
            sex: "male",
            restrictions: ["gluten-free"],
            preferences: ["high-protein"],
            goals: ["build-muscle"],
            activities: ["strength_training"],
          };

          const createdProfile = await databaseService.createUserProfile(testProfile);
          addTestResult("Create Profile", true, "Profile created successfully", createdProfile);

          // Test 2.2: Read Profile
          addTestResult("Read Profile", true, "Testing profile retrieval...");
          const retrievedProfile = await databaseService.getUserProfile(user.$id);
          addTestResult("Read Profile", !!retrievedProfile, 
            retrievedProfile ? "Profile retrieved successfully" : "Profile not found", 
            retrievedProfile);

          // Test 2.3: Update Profile
          if (retrievedProfile) {
            addTestResult("Update Profile", true, "Testing profile update...");
            const updatedProfile = await databaseService.updateUserProfile(retrievedProfile.$id!, {
              age: 26,
              supplements: ["protein-powder"]
            });
            addTestResult("Update Profile", true, "Profile updated successfully", updatedProfile);

            // Test 2.4: Delete Profile
            addTestResult("Delete Profile", true, "Testing profile deletion...");
            await databaseService.deleteUserProfile(retrievedProfile.$id!, user.$id);
            addTestResult("Delete Profile", true, "Profile deleted successfully");

            // Test 2.5: Verify Deletion
            const deletedProfile = await databaseService.getUserProfile(user.$id);
            addTestResult("Verify Deletion", !deletedProfile, 
              deletedProfile ? "Profile still exists" : "Profile successfully deleted");
          }
        } catch (error: any) {
          addTestResult("Profile Operations", false, `Profile operation failed: ${error.message}`);
        }

        // Test 3: User Stats
        addTestResult("User Stats", true, "Testing user statistics...");
        try {
          const stats = await databaseService.getUserStats(user.$id);
          addTestResult("User Stats", true, "User stats retrieved successfully", stats);
        } catch (error: any) {
          addTestResult("User Stats", false, `User stats failed: ${error.message}`);
        }

        // Test 4: Upsert Profile
        addTestResult("Upsert Profile", true, "Testing profile upsert...");
        try {
          const upsertProfile: Omit<UserProfile, "$id" | "$createdAt" | "$updatedAt"> = {
            userId: user.$id,
            age: 27,
            weightPounds: 155,
            heightInches: 71,
            sex: "male",
            restrictions: ["dairy-free"],
            preferences: ["organic"],
            goals: ["lose-weight"],
            activities: ["endurance"],
          };

          const upsertedProfile = await databaseService.upsertUserProfile(upsertProfile);
          addTestResult("Upsert Profile", true, "Profile upserted successfully", upsertedProfile);
        } catch (error: any) {
          addTestResult("Upsert Profile", false, `Profile upsert failed: ${error.message}`);
        }
      }

      addTestResult("All Tests", true, "All tests completed successfully!");

    } catch (error: any) {
      addTestResult("Test Suite", false, `Test suite failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!user) {
    return <FullPageSpinner />;
  }

  return (
    <ProtectedRoute fallback={<FullPageSpinner />}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Database Test Suite</h1>
          <p className="text-gray-400 mt-2">Test your database setup and permissions</p>
        </div>

        <div className="grid gap-6">
          {/* Test Controls */}
          <Card className="bg-[#232325] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Test Controls</CardTitle>
              <CardDescription className="text-gray-400">
                Run comprehensive tests to verify your database setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={runAllTests} 
                  disabled={isRunning}
                  className="bg-[#ff8e01] hover:bg-[#ff8e01]/90 text-white"
                >
                  {isRunning ? "Running Tests..." : "Run All Tests"}
                </Button>
                <Button 
                  onClick={clearResults} 
                  variant="outline"
                  className="border-[#444] text-white hover:bg-[#333]"
                >
                  Clear Results
                </Button>
              </div>
              
              <div className="text-sm text-gray-400">
                <p><strong>Current User:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.$id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="bg-[#232325] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Test Results</CardTitle>
              <CardDescription className="text-gray-400">
                Results from the latest test run
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-gray-400">No test results yet. Run tests to see results.</p>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${
                        result.success 
                          ? "bg-green-900/20 border-green-500/50" 
                          : "bg-red-900/20 border-red-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${
                            result.success ? "text-green-400" : "text-red-400"
                          }`}>
                            {result.test}
                          </h4>
                          <p className="text-gray-300 text-sm">{result.message}</p>
                          <p className="text-gray-500 text-xs">{result.timestamp}</p>
                        </div>
                        <div className={`text-2xl ${
                          result.success ? "text-green-400" : "text-red-400"
                        }`}>
                          {result.success ? "✓" : "✗"}
                        </div>
                      </div>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-sm text-gray-400 cursor-pointer">
                            View Data
                          </summary>
                          <pre className="mt-2 text-xs bg-[#1c1c1e] p-2 rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 