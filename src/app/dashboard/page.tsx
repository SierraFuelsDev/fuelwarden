"use client";

import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useEffect, useState } from "react";
import { databaseService, UserProfileForm, ActivityScheduleItem } from "../../lib/database";

const TIME_BLOCKS = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 18 },
  evening: { start: 18, end: 24 },
};

function getCurrentDayAndTimeBlock() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = days[now.getDay()];
  const hour = now.getHours();
  let timeOfDay: "morning" | "afternoon" | "evening" = "morning";
  if (hour >= 6 && hour < 12) timeOfDay = "morning";
  else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
  else timeOfDay = "evening";
  return { dayOfWeek, timeOfDay, hour };
}

function getNextActivity(activities: ActivityScheduleItem[]) {
  const { dayOfWeek, timeOfDay, hour } = getCurrentDayAndTimeBlock();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayIdx = days.indexOf(dayOfWeek);

  // Flatten activities with their day index and time block start hour
  const sorted = activities
    .map((a) => ({
      ...a,
      dayIdx: days.indexOf(a.dayOfWeek),
      blockStart: TIME_BLOCKS[a.timeOfDay].start,
    }))
    .sort((a, b) => {
      if (a.dayIdx !== b.dayIdx) return a.dayIdx - b.dayIdx;
      return a.blockStart - b.blockStart;
    });

  // Find the next activity today or later in the week
  for (let offset = 0; offset < 7; offset++) {
    const checkDayIdx = (todayIdx + offset) % 7;
    const isToday = offset === 0;
    const candidates = sorted.filter((a) => a.dayIdx === checkDayIdx);
    for (const act of candidates) {
      if (
        (isToday && act.blockStart > hour) ||
        (!isToday)
      ) {
        return act;
      }
    }
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextWorkout, setNextWorkout] = useState<ActivityScheduleItem | null>(null);
  // Remove mealPlan and upcomingMeal state

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.$id) return;
      setLoading(true);
      setError("");
      try {
        const profile: UserProfileForm | null = await databaseService.getUserProfile(user.$id);
        let activities: ActivityScheduleItem[] = [];
        if (profile && Array.isArray(profile.activitySchedule)) {
          activities = profile.activitySchedule
            .map(item => {
              try {
                return typeof item === "string" ? JSON.parse(item) : item;
              } catch {
                return null;
              }
            })
            .filter(Boolean) as ActivityScheduleItem[];
        }
        if (activities.length > 0) {
          const next = getNextActivity(activities);
          setNextWorkout(next);
        } else {
          setNextWorkout(null);
        }
        // Remove meal plan fetching logic
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
        setNextWorkout(null);
        // Remove meal plan error handling
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.name || 'User'}!</p>
      </div>
      {/* Remove upcoming meal overview */}
      <div className="space-y-6">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : nextWorkout ? (
          <Card className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Upcoming Workout</CardTitle>
                <Badge variant="secondary">{nextWorkout.activity}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{nextWorkout.activity}</p>
                  <p className="text-sm text-muted-foreground">{nextWorkout.dayOfWeek}, {nextWorkout.timeOfDay.charAt(0).toUpperCase() + nextWorkout.timeOfDay.slice(1)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{nextWorkout.durationMinutes || 60} min</p>
                  <p className="text-sm text-muted-foreground">{nextWorkout.intensity}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button className="flex-1">Start Workout</Button>
                <Button variant="outline" className="flex-1">Reschedule</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-muted-foreground">No upcoming workouts scheduled.</div>
        )}
      </div>
    </div>
  );
} 