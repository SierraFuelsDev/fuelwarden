"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { databaseService, UserProfile } from "../../lib/database";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form validation schema
const profileSchema = z.object({
  age: z.number().min(13, "Age must be at least 13").max(120, "Age must be less than 120"),
  sex: z.enum(["male", "female", "other"]),
  weightPounds: z.number().min(50, "Weight must be at least 50 lbs").max(500, "Weight must be less than 500 lbs"),
  heightInches: z.number().min(48, "Height must be at least 48 inches").max(96, "Height must be less than 96 inches"),
  wakeupTime: z.string().optional(),
  bedTime: z.string().optional(),
  restrictions: z.array(z.string()),
  preferences: z.array(z.string()),
  goals: z.array(z.string()),
  activities: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Predefined options for multi-select fields
const RESTRICTION_OPTIONS = [
  "Gluten-free", "Dairy-free", "Vegetarian", "Vegan", "Nut-free", 
  "Shellfish-free", "Soy-free", "Egg-free", "Low-carb", "Keto", "Paleo"
];

const PREFERENCE_OPTIONS = [
  "High protein", "Low fat", "High fiber", "Organic", "Local produce",
  "Meal prep friendly", "Quick meals", "Budget conscious", "Gourmet", "Simple recipes"
];

const GOAL_OPTIONS = [
  "Build muscle", "Lose weight", "Maintain weight", "Improve performance",
  "Increase energy", "Better recovery", "General health", "Athletic performance"
];

const ACTIVITY_OPTIONS = [
  "Weightlifting", "Running", "Cycling", "Swimming", "Yoga", "CrossFit",
  "Team sports", "Hiking", "Martial arts", "Dancing", "Walking", "Other"
];

const SUPPLEMENT_OPTIONS = [
  "Protein powder", "Creatine", "BCAAs", "Multivitamin", "Omega-3",
  "Vitamin D", "Pre-workout", "Post-workout", "None"
];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<{
    totalMealLogs: number;
    totalMealPlans: number;
    totalActivities: number;
    profileComplete: boolean;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: 0,
      sex: "male" as "male" | "female" | "other",
      weightPounds: 0,
      heightInches: 0,
      wakeupTime: "",
      bedTime: "",
      restrictions: [],
      preferences: [],
      goals: [],
      activities: [],
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.$id) {
        setIsLoading(false);
        return;
      }

      try {
        const [profile, stats] = await Promise.all([
          databaseService.getUserProfile(user.$id),
          databaseService.getUserStats(user.$id)
        ]);
        
        setUserProfile(profile);
        setUserStats(stats);
        
        if (profile) {
          // Populate form with existing data
          reset({
            age: profile.age,
            sex: profile.sex,
            weightPounds: profile.weightPounds,
            heightInches: profile.heightInches,
            wakeupTime: profile.wakeupTime || "",
            bedTime: profile.bedTime || "",
            restrictions: profile.restrictions || [],
            preferences: profile.preferences || [],
            goals: profile.goals || [],
            activities: profile.activities || [],
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setSaveMessage("Failed to load profile data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.$id) {
      setSaveMessage("No user ID available. Please log in again.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      if (userProfile) {
        // Update existing profile
        await databaseService.updateUserProfile(userProfile.$id!, {
          age: data.age,
          sex: data.sex,
          weightPounds: data.weightPounds,
          heightInches: data.heightInches,
          wakeupTime: data.wakeupTime,
          bedTime: data.bedTime,
          restrictions: data.restrictions,
          preferences: data.preferences,
          goals: data.goals,
          activities: data.activities,
        });
      } else {
        // Create new profile
        await databaseService.createUserProfile({
          userId: user.$id,
          age: data.age,
          sex: data.sex,
          weightPounds: data.weightPounds,
          heightInches: data.heightInches,
          wakeupTime: data.wakeupTime,
          bedTime: data.bedTime,
          restrictions: data.restrictions,
          preferences: data.preferences,
          goals: data.goals,
          activities: data.activities,
        });
      }
      
      setSaveMessage("Profile updated successfully!");
      
      // Reload profile data and stats
      const [updatedProfile, updatedStats] = await Promise.all([
        databaseService.getUserProfile(user.$id),
        databaseService.getUserStats(user.$id)
      ]);
      setUserProfile(updatedProfile);
      setUserStats(updatedStats);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user?.$id || !userProfile?.$id) {
      setSaveMessage("No profile to delete.");
      return;
    }

    if (!confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setSaveMessage("");

    try {
      await databaseService.deleteUserProfile(userProfile.$id, user.$id);
      setUserProfile(null);
      setUserStats(null);
      setSaveMessage("Profile deleted successfully!");
      
      // Reset form to default values
      reset({
        age: 0,
        sex: "male" as "male" | "female" | "other",
        weightPounds: 0,
        heightInches: 0,
        wakeupTime: "",
        bedTime: "",
        restrictions: [],
        preferences: [],
        goals: [],
        activities: [],
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting profile:", error);
      setSaveMessage("Failed to delete profile. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleArrayValue = (field: keyof ProfileFormData, value: string) => {
    const currentValues = watchedValues[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field, newValues);
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <ProtectedRoute fallback={<FullPageSpinner />}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400 mt-2">Manage your personal information and preferences</p>
        </div>

        {/* Success/Error Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.includes("successfully") 
              ? "bg-green-900/20 border border-green-500/50 text-green-400" 
              : "bg-red-900/20 border border-red-500/50 text-red-400"
          }`}>
            {saveMessage}
          </div>
        )}

        <div className="grid gap-6">
          {/* User Statistics */}
          {userStats && (
            <Card className="bg-[#232325] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Your Activity</CardTitle>
                <CardDescription className="text-gray-400">
                  Overview of your FuelWarden usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-[#1c1c1e] rounded-lg border border-[#444]">
                    <div className="text-2xl font-bold text-[#ff8e01]">{userStats.totalMealLogs}</div>
                    <div className="text-sm text-gray-400">Meal Logs</div>
                  </div>
                  <div className="text-center p-4 bg-[#1c1c1e] rounded-lg border border-[#444]">
                    <div className="text-2xl font-bold text-[#ff8e01]">{userStats.totalMealPlans}</div>
                    <div className="text-sm text-gray-400">Meal Plans</div>
                  </div>
                  <div className="text-center p-4 bg-[#1c1c1e] rounded-lg border border-[#444]">
                    <div className="text-2xl font-bold text-[#ff8e01]">{userStats.totalActivities}</div>
                    <div className="text-sm text-gray-400">Activities</div>
                  </div>
                  <div className="text-center p-4 bg-[#1c1c1e] rounded-lg border border-[#444]">
                    <div className="text-2xl font-bold text-[#ff8e01]">
                      {userStats.profileComplete ? "✓" : "✗"}
                    </div>
                    <div className="text-sm text-gray-400">Profile Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Information */}
          <Card className="bg-[#232325] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription className="text-gray-400">
                Your basic account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#ff8e01] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {user?.name || 'No name set'}
                  </h3>
                  <p className="text-gray-400">{user?.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {user?.$createdAt ? new Date(user.$createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="bg-[#232325] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-gray-400">
                Update your profile details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age" className="text-white">Age</Label>
                    <Controller
                      name="age"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          id="age"
                          value={field.value === 0 ? "" : field.value}
                          className="bg-[#1c1c1e] border-[#444] text-white"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />
                    {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age.message}</p>}
                  </div>

                  <div>
                    <Label className="text-white">Sex</Label>
                    <div className="flex gap-4 mt-2">
                      {["male", "female", "other"].map((option) => (
                        <Controller
                          key={option}
                          name="sex"
                          control={control}
                          render={({ field }) => (
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                value={option}
                                checked={field.value === option}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="text-[#ff8e01] bg-[#1c1c1e] border-[#444]"
                              />
                              <span className="text-white capitalize">{option}</span>
                            </label>
                          )}
                        />
                      ))}
                    </div>
                    {errors.sex && <p className="text-red-400 text-sm mt-1">{errors.sex.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="weight" className="text-white">Weight (pounds)</Label>
                    <Controller
                      name="weightPounds"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          id="weight"
                          value={field.value === 0 ? "" : field.value}
                          className="bg-[#1c1c1e] border-[#444] text-white"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />
                    {errors.weightPounds && <p className="text-red-400 text-sm mt-1">{errors.weightPounds.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="height" className="text-white">Height (inches)</Label>
                    <Controller
                      name="heightInches"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          id="height"
                          value={field.value === 0 ? "" : field.value}
                          className="bg-[#1c1c1e] border-[#444] text-white"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />
                    {errors.heightInches && <p className="text-red-400 text-sm mt-1">{errors.heightInches.message}</p>}
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wakeupTime" className="text-white">Wake-up Time (optional)</Label>
                    <Controller
                      name="wakeupTime"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="time"
                          id="wakeupTime"
                          className="bg-[#1c1c1e] border-[#444] text-white"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bedTime" className="text-white">Bed Time (optional)</Label>
                    <Controller
                      name="bedTime"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="time"
                          id="bedTime"
                          className="bg-[#1c1c1e] border-[#444] text-white"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Dietary Restrictions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {RESTRICTION_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={watchedValues.restrictions?.includes(option)}
                            onChange={() => toggleArrayValue("restrictions", option)}
                            className="text-[#ff8e01] bg-[#1c1c1e] border-[#444]"
                          />
                          <span className="text-white text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Food Preferences</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {PREFERENCE_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={watchedValues.preferences?.includes(option)}
                            onChange={() => toggleArrayValue("preferences", option)}
                            className="text-[#ff8e01] bg-[#1c1c1e] border-[#444]"
                          />
                          <span className="text-white text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Goals</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {GOAL_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={watchedValues.goals?.includes(option)}
                            onChange={() => toggleArrayValue("goals", option)}
                            className="text-[#ff8e01] bg-[#1c1c1e] border-[#444]"
                          />
                          <span className="text-white text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Activities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {ACTIVITY_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={watchedValues.activities?.includes(option)}
                            onChange={() => toggleArrayValue("activities", option)}
                            className="text-[#ff8e01] bg-[#1c1c1e] border-[#444]"
                          />
                          <span className="text-white text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-6">
                  <div>
                    {saveMessage && (
                      <p className={`text-sm ${saveMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                        {saveMessage}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#ff8e01] hover:bg-[#ff9e2b] text-white disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-[#232325] border-[#333]">
            <CardHeader>
              <CardTitle className="text-white">Account Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full border-[#ff8e01] text-[#ff8e01] hover:bg-[#ff8e01] hover:text-white"
                >
                  Change Password
                </Button>
                <Button 
                  onClick={signOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Sign Out
                </Button>
                <Button 
                  onClick={handleDeleteProfile}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 