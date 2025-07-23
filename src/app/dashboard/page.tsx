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
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.name || 'User'}!</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Overview */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Today's Overview</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your nutrition summary for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calories</span>
                <span className="text-card-foreground font-semibold">0 / 2000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protein</span>
                <span className="text-card-foreground font-semibold">0g / 150g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carbs</span>
                <span className="text-card-foreground font-semibold">0g / 250g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fat</span>
                <span className="text-card-foreground font-semibold">0g / 65g</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Meal Plan */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Daily Fueling</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your planned meals for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Breakfast</div>
                <div className="text-card-foreground">No meal planned</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Lunch</div>
                <div className="text-card-foreground">No meal planned</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Dinner</div>
                <div className="text-card-foreground">No meal planned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => handleQuickAction("log-meal")}
                className="w-full"
              >
                Log Today's Meal
              </Button>
              <Button 
                onClick={() => handleQuickAction("plan-meals")}
                variant="outline"
                className="w-full"
              >
                Plan Tomorrow's Meals
              </Button>
              <Button 
                onClick={() => handleQuickAction("view-progress")}
                variant="outline"
                className="w-full"
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