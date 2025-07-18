"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { databaseService, UserProfileForm } from "../../lib/database";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Clock, 
  Utensils, 
  Target, 
  Activity, 
  Pill, 
  Save, 
  Trash2, 
  LogOut,
  Check
} from "lucide-react";

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
  supplements: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Tab configuration
const TABS = [
  { id: 'basic', label: 'Basic', icon: User },
  { id: 'schedule', label: 'Schedule', icon: Clock },
  { id: 'dietary', label: 'Dietary', icon: Utensils },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'supplements', label: 'Supplements', icon: Pill },
];

// Predefined options
const RESTRICTION_OPTIONS = [
  { value: "gluten-free", label: "Gluten-free" },
  { value: "dairy-free", label: "Dairy-free" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "nut-free", label: "Nut-free" },
  { value: "shellfish-free", label: "Shellfish-free" },
  { value: "soy-free", label: "Soy-free" },
  { value: "egg-free", label: "Egg-free" },
  { value: "low-carb", label: "Low-carb" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "none", label: "No restrictions" }
];

const PREFERENCE_OPTIONS = [
  { value: "high-protein", label: "High protein" },
  { value: "low-fat", label: "Low fat" },
  { value: "high-fiber", label: "High fiber" },
  { value: "organic", label: "Organic" },
  { value: "local-produce", label: "Local produce" },
  { value: "meal-prep", label: "Meal prep" },
  { value: "quick-meals", label: "Quick meals" },
  { value: "budget-conscious", label: "Budget conscious" },
  { value: "gourmet", label: "Gourmet" },
  { value: "simple-recipes", label: "Simple recipes" }
];

const GOAL_OPTIONS = [
  { value: "build-muscle", label: "Build muscle" },
  { value: "lose-weight", label: "Lose weight" },
  { value: "maintain-weight", label: "Maintain weight" },
  { value: "improve-performance", label: "Improve performance" },
  { value: "increase-energy", label: "Increase energy" },
  { value: "better-recovery", label: "Better recovery" },
  { value: "general-health", label: "General health" },
  { value: "athletic-performance", label: "Athletic performance" }
];

const ACTIVITY_OPTIONS = [
  { value: "strength_training", label: "Strength Training" },
  { value: "high_intensity", label: "High-Intensity Training" },
  { value: "endurance", label: "Endurance Cardio" },
  { value: "team_sports", label: "Team Sports" },
  { value: "combat_sports", label: "Combat Sports" },
  { value: "recreational", label: "Recreational Movement" },
  { value: "mobility_focus", label: "Mobility/Recovery" },
  { value: "other", label: "Other" }
];

const SUPPLEMENT_OPTIONS = [
  { value: "protein-powder", label: "Protein Powder" },
  { value: "creatine", label: "Creatine" },
  { value: "bcaas", label: "BCAAs" },
  { value: "multivitamin", label: "Multivitamin" },
  { value: "omega-3", label: "Omega-3" },
  { value: "vitamin-d", label: "Vitamin D" },
  { value: "pre-workout", label: "Pre-workout" },
  { value: "post-workout", label: "Post-workout" },
  { value: "none", label: "None" }
];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfileForm | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

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
      supplements: [],
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
        const profile = await databaseService.getUserProfile(user.$id);
        setUserProfile(profile);
        
        if (profile) {
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
            supplements: profile.supplements || [],
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
        await databaseService.updateUserProfile(userProfile.$id!, data);
      } else {
        await databaseService.createUserProfile({
          userId: user.$id,
          ...data
        });
      }
      
      setSaveMessage("Profile updated successfully!");
      
      const updatedProfile = await databaseService.getUserProfile(user.$id);
      setUserProfile(updatedProfile);
      
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
      await databaseService.deleteUserProfile(userProfile.$id);
      setUserProfile(null);
      setSaveMessage("Profile deleted successfully!");
      
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
        supplements: [],
      });
      
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
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#333]">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Profile</h1>
                <p className="text-sm text-gray-400">Edit your preferences</p>
              </div>
              <Button
                onClick={signOut}
                size="sm"
                variant="outline"
                className="border-[#444] text-gray-400 hover:text-white hover:bg-[#333]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {saveMessage && (
          <div className="max-w-md mx-auto px-4 py-2">
            <div className={`p-3 rounded-lg text-sm ${
              saveMessage.includes("successfully") 
                ? "bg-green-900/20 border border-green-500/50 text-green-400" 
                : "bg-red-900/20 border border-red-500/50 text-red-400"
            }`}>
              {saveMessage}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex space-x-1 bg-[#1c1c1e] rounded-lg p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3 px-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#ff8e01] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-md mx-auto px-4 pb-24">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <Card className="bg-[#1c1c1e] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-400" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age" className="text-white text-sm">Age</Label>
                        <Controller
                          name="age"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              id="age"
                              placeholder="25"
                              value={field.value === 0 ? "" : field.value}
                              className="bg-[#232325] border-[#444] text-white mt-1"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          )}
                        />
                        {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>}
                      </div>

                      <div>
                        <Label className="text-white text-sm">Sex</Label>
                        <div className="flex gap-1 mt-1">
                          {["male", "female", "other"].map((option) => (
                            <Controller
                              key={option}
                              name="sex"
                              control={control}
                              render={({ field }) => (
                                <button
                                  type="button"
                                  onClick={() => field.onChange(option)}
                                  className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                                    field.value === option
                                      ? 'bg-[#ff8e01] text-white'
                                      : 'bg-[#232325] text-gray-400 hover:text-white'
                                  }`}
                                >
                                  {option.charAt(0).toUpperCase() + option.slice(1)}
                                </button>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight" className="text-white text-sm">Weight (lbs)</Label>
                        <Controller
                          name="weightPounds"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              id="weight"
                              placeholder="150"
                              value={field.value === 0 ? "" : field.value}
                              className="bg-[#232325] border-[#444] text-white mt-1"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          )}
                        />
                        {errors.weightPounds && <p className="text-red-400 text-xs mt-1">{errors.weightPounds.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="height" className="text-white text-sm">Height (in)</Label>
                        <Controller
                          name="heightInches"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              id="height"
                              placeholder="70"
                              value={field.value === 0 ? "" : field.value}
                              className="bg-[#232325] border-[#444] text-white mt-1"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          )}
                        />
                        {errors.heightInches && <p className="text-red-400 text-xs mt-1">{errors.heightInches.message}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving}
                  className="w-full bg-[#ff8e01] hover:bg-[#ff9e2b] text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <Card className="bg-[#1c1c1e] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-purple-400" />
                      Daily Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="wakeupTime" className="text-white text-sm">Wake-up Time</Label>
                        <Controller
                          name="wakeupTime"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="time"
                              id="wakeupTime"
                              className="bg-[#232325] border-[#444] text-white mt-1"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bedTime" className="text-white text-sm">Bed Time</Label>
                        <Controller
                          name="bedTime"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="time"
                              id="bedTime"
                              className="bg-[#232325] border-[#444] text-white mt-1"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving}
                  className="w-full bg-[#ff8e01] hover:bg-[#ff9e2b] text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

            {/* Dietary Tab */}
            {activeTab === 'dietary' && (
              <div className="space-y-6">
                <Card className="bg-[#1c1c1e] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Utensils className="w-5 h-5 mr-2 text-green-400" />
                      Dietary Restrictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {RESTRICTION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleArrayValue("restrictions", option.value)}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            watchedValues.restrictions?.includes(option.value)
                              ? 'border-[#ff8e01] bg-[#ff8e01]/10'
                              : 'border-[#444] bg-[#232325] hover:border-[#666]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">{option.label}</span>
                            {watchedValues.restrictions?.includes(option.value) && (
                              <Check className="w-4 h-4 text-[#ff8e01]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1c1c1e] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Utensils className="w-5 h-5 mr-2 text-green-400" />
                      Food Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {PREFERENCE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleArrayValue("preferences", option.value)}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            watchedValues.preferences?.includes(option.value)
                              ? 'border-[#ff8e01] bg-[#ff8e01]/10'
                              : 'border-[#444] bg-[#232325] hover:border-[#666]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">{option.label}</span>
                            {watchedValues.preferences?.includes(option.value) && (
                              <Check className="w-4 h-4 text-[#ff8e01]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving}
                  className="w-full bg-[#ff8e01] hover:bg-[#ff9e2b] text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
              <div className="space-y-4">
                <Card className="bg-[#1c1c1e] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2 text-orange-400" />
                      Fitness Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {GOAL_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleArrayValue("goals", option.value)}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            watchedValues.goals?.includes(option.value)
                              ? 'border-[#ff8e01] bg-[#ff8e01]/10'
                              : 'border-[#444] bg-[#232325] hover:border-[#666]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">{option.label}</span>
                            {watchedValues.goals?.includes(option.value) && (
                              <Check className="w-4 h-4 text-[#ff8e01]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving}
                  className="w-full bg-[#ff8e01] hover:bg-[#ff9e2b] text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="space-y-4">
                <Card className="bg-[#1c1c1e] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-red-400" />
                      Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {ACTIVITY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleArrayValue("activities", option.value)}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            watchedValues.activities?.includes(option.value)
                              ? 'border-[#ff8e01] bg-[#ff8e01]/10'
                              : 'border-[#444] bg-[#232325] hover:border-[#666]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">{option.label}</span>
                            {watchedValues.activities?.includes(option.value) && (
                              <Check className="w-4 h-4 text-[#ff8e01]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving}
                  className="w-full bg-[#ff8e01] hover:bg-[#ff9e2b] text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}

            {/* Supplements Tab */}
            {activeTab === 'supplements' && (
              <div className="space-y-4">
                <Card className="bg-[#1c1c1e] border-[#333]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Pill className="w-5 h-5 mr-2 text-cyan-400" />
                      Supplements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {SUPPLEMENT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleArrayValue("supplements", option.value)}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            watchedValues.supplements?.includes(option.value)
                              ? 'border-[#ff8e01] bg-[#ff8e01]/10'
                              : 'border-[#444] bg-[#232325] hover:border-[#666]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">{option.label}</span>
                            {watchedValues.supplements?.includes(option.value) && (
                              <Check className="w-4 h-4 text-[#ff8e01]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving}
                  className="w-full bg-[#ff8e01] hover:bg-[#ff9e2b] text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Bottom Action Bar - Only Delete */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-[#333] p-4">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50 text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {isDeleting ? "Deleting..." : "Delete Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 