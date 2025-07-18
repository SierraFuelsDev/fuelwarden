"use client";

import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "log-meal":
        router.push("/mealLog");
        break;
      case "plan-meals":
        router.push("/mealPlan");
        break;
      case "view-progress":
        // This could be a progress page or analytics
        console.log("View progress clicked");
        break;
      default:
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back, {user?.name || 'User'}!</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Overview */}
        <Card className="bg-[#232325] border-[#333]">
          <CardHeader>
            <CardTitle className="text-white">Today's Overview</CardTitle>
            <CardDescription className="text-gray-400">
              Your nutrition summary for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Calories</span>
                <span className="text-white font-semibold">0 / 2000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Protein</span>
                <span className="text-white font-semibold">0g / 150g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Carbs</span>
                <span className="text-white font-semibold">0g / 250g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Fat</span>
                <span className="text-white font-semibold">0g / 65g</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Meal Plan */}
        <Card className="bg-[#232325] border-[#333]">
          <CardHeader>
            <CardTitle className="text-white">Daily Fueling</CardTitle>
            <CardDescription className="text-gray-400">
              Your planned meals for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-[#1c1c1e] rounded-lg">
                <div className="text-sm text-gray-400">Breakfast</div>
                <div className="text-white">No meal planned</div>
              </div>
              <div className="p-3 bg-[#1c1c1e] rounded-lg">
                <div className="text-sm text-gray-400">Lunch</div>
                <div className="text-white">No meal planned</div>
              </div>
              <div className="p-3 bg-[#1c1c1e] rounded-lg">
                <div className="text-sm text-gray-400">Dinner</div>
                <div className="text-white">No meal planned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-[#232325] border-[#333]">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => handleQuickAction("log-meal")}
                className="w-full bg-[#ff8e01] hover:bg-[#ff9e2b] text-white"
              >
                Log Today's Meal
              </Button>
              <Button 
                onClick={() => handleQuickAction("plan-meals")}
                className="w-full bg-[#1c1c1e] hover:bg-[#333] text-white border border-[#444]"
              >
                Plan Tomorrow's Meals
              </Button>
              <Button 
                onClick={() => handleQuickAction("view-progress")}
                className="w-full bg-[#1c1c1e] hover:bg-[#333] text-white border border-[#444]"
              >
                View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 