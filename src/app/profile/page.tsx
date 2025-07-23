"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { User, Calendar, Lock, LifeBuoy, Plus, Trash2, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { databaseService, UserProfileForm, ActivityScheduleItem } from "../../lib/database";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import ChangePasswordForm from "../../components/auth/ChangePasswordForm";

const TABS = [
  { key: "profile", label: "Profile Info", icon: User },
  { key: "schedule", label: "Activity Schedule", icon: Calendar },
  { key: "password", label: "Change Password", icon: Lock },
  { key: "support", label: "Support", icon: LifeBuoy },
];

// --- Profile Info Schema (reuse onboarding, minus schedule) ---
const genderSchema = z.object({ gender: z.enum(["male", "female", "other"]) });
const performanceObjectiveSchema = z.object({ performanceObjective: z.enum(["in-season-peak", "off-season-build", "pre-season-cut", "maintain-recover", "not-sure"]) });
const trainingCompetitionSchema = z.object({ trainingCompetition: z.array(z.string()).min(1, "Select at least one activity").max(2, "Select up to 2 activities") });
const dietSchema = z.object({ diet: z.array(z.string()).min(1, "Select at least one diet preference") });
const heightWeightSchema = z.object({
  heightWeight: z.object({
    heightFeet: z.number().min(3).max(7),
    heightInches: z.number().min(0).max(11),
    weightPounds: z.number().min(20).max(500),
    unitSystem: z.enum(["imperial", "metric"]),
  }),
});
const profileInfoSchema = genderSchema
  .merge(heightWeightSchema)
  .merge(performanceObjectiveSchema)
  .merge(trainingCompetitionSchema)
  .merge(dietSchema);

type ProfileInfoFormData = z.infer<typeof profileInfoSchema>;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];
const PERFORMANCE_OBJECTIVE_OPTIONS = [
  { value: "in-season-peak", label: "In-Season Peak" },
  { value: "off-season-build", label: "Off-Season Build" },
  { value: "pre-season-cut", label: "Pre-Season Cut" },
  { value: "maintain-recover", label: "Maintain & Recover" },
  { value: "not-sure", label: "Not Sure" },
];
const TRAINING_COMPETITION_OPTIONS = [
  { value: "team_sports", label: "Team Sports" },
  { value: "combat_weight_class", label: "Combat & Weight-Class Sports" },
  { value: "endurance_sports", label: "Endurance Sports" },
  { value: "hybrid_functional", label: "Hybrid / Functional Fitness" },
  { value: "general_fitness_aesthetics", label: "General Fitness & Aesthetics" },
];
const DIET_OPTIONS = [
  { value: "classic", label: "Classic Diet (no preference)" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "kosher", label: "Kosher" },
  { value: "dairy-free", label: "Dairy-Free" },
  { value: "halal", label: "Halal" },
  { value: "paleo", label: "Paleo" },
  { value: "low-carb-keto", label: "Low Carb / Keto" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
];

function ProfileInfoForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfileForm | undefined>(undefined);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isDirty, isSubmitting } } = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      gender: "male",
      heightWeight: {
        heightFeet: 5,
        heightInches: 10,
        weightPounds: 180,
        unitSystem: "imperial",
      },
      performanceObjective: "in-season-peak",
      trainingCompetition: [],
      diet: [],
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.$id) return;
      setLoading(true);
      try {
        const prof = await databaseService.getUserProfile(user.$id);
        if (prof) {
          setProfile(prof);
          reset({
            gender: prof.sex,
            heightWeight: {
              heightFeet: Math.floor((prof.heightInches || 70) / 12),
              heightInches: (prof.heightInches || 70) % 12,
              weightPounds: prof.weightPounds || 180,
              unitSystem: "imperial", // TODO: support metric if needed
            },
            performanceObjective: prof.performanceObjective as any,
            trainingCompetition: prof.trainingCompetition || [],
            diet: prof.diet || [],
          });
        }
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileInfoFormData) => {
    setError("");
    setSuccess(false);
    if (!user?.$id || !profile?.$id) return;
    try {
      await databaseService.updateUserProfile(profile.$id, {
        sex: data.gender,
        heightInches: data.heightWeight.heightFeet * 12 + data.heightWeight.heightInches,
        weightPounds: data.heightWeight.weightPounds,
        performanceObjective: data.performanceObjective,
        trainingCompetition: data.trainingCompetition,
        diet: data.diet,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto">
      <div className="flex flex-col gap-6"> {/* Increased gap for better spacing */}
        {/* Height & Weight */}
        <div className="flex gap-8 mb-4"> {/* Increased gap and margin for better spacing */}
          <div>
            <Label className="text-lg font-semibold mb-1">Height</Label>
            <div className="flex gap-2 mt-1">
              <Input type="number" min={3} max={7} {...register("heightWeight.heightFeet", { valueAsNumber: true })} className="w-16" placeholder="ft" />
              <Input type="number" min={0} max={11} {...register("heightWeight.heightInches", { valueAsNumber: true })} className="w-16" placeholder="in" />
            </div>
          </div>
          <div>
            <Label className="text-lg font-semibold mb-1">Weight (lbs)</Label>
            <Input type="number" min={20} max={500} {...register("heightWeight.weightPounds", { valueAsNumber: true })} className="w-24 mt-1" />
          </div>
        </div>
        {/* Performance Objective */}
        <div className="mb-4">
          <Label className="text-lg font-semibold mb-1">Performance Objective</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {PERFORMANCE_OBJECTIVE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`px-4 py-2 rounded-lg border transition-colors ${watch("performanceObjective") === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary/50"}`}
                onClick={() => setValue("performanceObjective", opt.value as any, { shouldDirty: true })}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.performanceObjective && <p className="text-red-500 text-sm mt-1">{errors.performanceObjective.message}</p>}
        </div>
        {/* Training/Competition */}
        <div className="mb-4">
          <Label className="text-lg font-semibold mb-1">Training/Competition</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {TRAINING_COMPETITION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`px-4 py-2 rounded-lg border transition-colors ${watch("trainingCompetition")?.includes(opt.value) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary/50"}`}
                onClick={() => {
                  const current = watch("trainingCompetition") || [];
                  if (current.includes(opt.value)) {
                    setValue("trainingCompetition", current.filter((v: string) => v !== opt.value), { shouldDirty: true });
                  } else if (current.length < 2) {
                    setValue("trainingCompetition", [...current, opt.value], { shouldDirty: true });
                  }
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.trainingCompetition && <p className="text-red-500 text-sm mt-1">{errors.trainingCompetition.message}</p>}
        </div>
        {/* Diet Preferences */}
        <div className="mb-4">
          <Label className="text-lg font-semibold mb-1">Diet Preferences</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {DIET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`px-4 py-2 rounded-lg border transition-colors ${watch("diet")?.includes(opt.value) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary/50"}`}
                onClick={() => {
                  const current = watch("diet") || [];
                  if (current.includes(opt.value)) {
                    setValue("diet", current.filter((v: string) => v !== opt.value), { shouldDirty: true });
                  } else {
                    setValue("diet", [...current, opt.value], { shouldDirty: true });
                  }
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.diet && <p className="text-red-500 text-sm mt-1">{errors.diet.message}</p>}
        </div>
      </div>
      <div className="flex gap-4 items-center mt-6"> {/* Added margin-top for better spacing */}
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        {success && <span className="text-green-600">Profile updated!</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </form>
  );
}

// Activity Schedule Form for Profile Settings
const DAYS_OF_WEEK = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];
const TIME_OF_DAY_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];
const INTENSITY_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "intense", label: "Intense" },
];
const ACTIVITY_TYPE_OPTIONS = [
  { value: "practice", label: "Practice" },
  { value: "lift", label: "Lift" },
  { value: "conditioning", label: "Conditioning" },
  { value: "competition", label: "Competition" },
  { value: "recovery", label: "Recovery" },
  { value: "hybrid", label: "Hybrid" },
];

function ProfileActivityScheduleForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activities, setActivities] = useState<ActivityScheduleItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newActivity, setNewActivity] = useState<any>({
    activityType: "",
    selectedDays: [],
    timeOfDay: "morning",
    intensity: "moderate",
    durationMinutes: 60,
    notes: ""
  });
  const [profileId, setProfileId] = useState<string | undefined>(undefined);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.$id) return;
      setLoading(true);
      try {
        const prof = await databaseService.getUserProfile(user.$id);
        if (prof) {
          // Handle both string[] and ActivityScheduleItem[]
          if (Array.isArray(prof.activitySchedule) && prof.activitySchedule.length > 0) {
            if (typeof prof.activitySchedule[0] === 'string') {
              // Use intermediate variable to satisfy TypeScript
              const raw: unknown = prof.activitySchedule;
              const arr = raw as string[];
              const parsed = arr.map(item => {
                try {
                  const obj = JSON.parse(item);
                  if (
                    obj &&
                    typeof obj === 'object' &&
                    typeof obj.dayOfWeek === 'string' &&
                    typeof obj.timeOfDay === 'string' &&
                    typeof obj.activity === 'string' &&
                    typeof obj.intensity === 'string'
                  ) {
                    return obj as ActivityScheduleItem;
                  }
                  return null;
                } catch {
                  return null;
                }
              }).filter((item): item is ActivityScheduleItem => !!item);
              setActivities(parsed);
            } else if (typeof prof.activitySchedule[0] === 'object') {
              setActivities(prof.activitySchedule as unknown as ActivityScheduleItem[]);
            }
          } else {
            setActivities([]);
          }
          setProfileId(prof.$id);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load activity schedule");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const addActivity = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const saveActivity = () => {
    if (newActivity.activityType && newActivity.selectedDays.length > 0) {
      const newActs = newActivity.selectedDays.map((day: string) => ({
        dayOfWeek: day,
        timeOfDay: newActivity.timeOfDay,
        activity: newActivity.activityType,
        intensity: newActivity.intensity,
        durationMinutes: newActivity.durationMinutes || 60,
        notes: newActivity.notes || "",
      }));
      setActivities(prev => [...prev, ...newActs]);
      setNewActivity({
        activityType: "",
        selectedDays: [],
        timeOfDay: "morning",
        intensity: "moderate",
        durationMinutes: 60,
        notes: ""
      });
      setShowModal(false);
      setDirty(true);
    }
  };

  const removeActivity = (index: number) => {
    setActivities(prev => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!user?.$id || !profileId) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await databaseService.updateUserProfile(profileId, {
        activitySchedule: activities.map(a => JSON.stringify(a)), // Save as string[]
      });
      setSuccess(true);
      setDirty(false);
    } catch (e: any) {
      setError(e.message || "Failed to save activity schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Group activities by day
  const groupedActivities = activities.reduce((acc: Record<string, ActivityScheduleItem[]>, activity) => {
    if (!acc[activity.dayOfWeek]) acc[activity.dayOfWeek] = [];
    acc[activity.dayOfWeek].push(activity);
    return acc;
  }, {});
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-2xl font-bold mb-3">Weekly Training Schedule</h2>
        <p className="text-gray-500 text-base">Set up your weekly training routine to help us optimize your meal timing.</p>
      </div>
      <button
        type="button"
        onClick={addActivity}
        className="w-full p-4 border-2 border-dashed border-border rounded-lg text-gray-400 hover:border-primary hover:text-primary transition-colors"
      >
        <div className="flex items-center justify-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Activity</span>
        </div>
      </button>
      <div className="space-y-6">
        {dayOrder.map(day => {
          const dayActivities = groupedActivities[day] || [];
          return (
            <div key={day} className="space-y-3">
              <h3 className="font-bold text-lg">{day}</h3>
              {dayActivities.length > 0 ? (
                <div className="space-y-3">
                  {dayActivities.map((activity, idx) => {
                    // Find the index in the main activities array for removal
                    const globalIndex = activities.findIndex(a => a === activity);
                    // Get label for activity type
                    const activityLabel = ACTIVITY_TYPE_OPTIONS.find(opt => opt.value === activity.activity)?.label || activity.activity;
                    // Get label and range for time of day
                    const timeOption = TIME_OF_DAY_OPTIONS.find(opt => opt.value === activity.timeOfDay);
                    let timeRange = "";
                    switch (activity.timeOfDay) {
                      case "morning": timeRange = "6AM-12PM"; break;
                      case "afternoon": timeRange = "12PM-6PM"; break;
                      case "evening": timeRange = "6PM-12AM"; break;
                      default: timeRange = "";
                    }
                    // Intensity badge color
                    let intensityColor = "";
                    switch (activity.intensity) {
                      case "intense": intensityColor = "bg-red-800 text-white"; break;
                      case "moderate": intensityColor = "bg-amber-700 text-white"; break;
                      case "light": intensityColor = "bg-green-800 text-white"; break;
                      default: intensityColor = "bg-gray-800 text-white";
                    }
                    return (
                      <div key={`${day}-${idx}`} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium text-lg text-white">{activityLabel}</div>
                          <button
                            onClick={() => removeActivity(globalIndex)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete activity"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="text-gray-400 text-base flex items-center gap-2">
                          {timeOption && (<span>{timeOption.label} ({timeRange})</span>)}
                          <span>•</span>
                          <span>{activity.durationMinutes} minutes</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-gray-400 text-base flex items-center gap-1">
                            <Clock className="w-5 h-5 inline mr-1" />
                            {timeOption && (<span>{timeOption.label} ({timeRange})</span>)}
                          </div>
                          <span className={`px-3 py-1 rounded text-base font-medium ${intensityColor}`}>{activity.intensity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-gray-500 text-sm text-center">No activities planned</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Modal for adding activity */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Add Activity</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {/* Activity Type */}
              <div className="mb-6">
                <Label className="text-sm">Activity Type</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {ACTIVITY_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewActivity((prev: any) => ({ ...prev, activityType: option.value }))}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        newActivity.activityType === option.value
                          ? "border-primary bg-card"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Days Selection */}
              <div className="mb-6">
                <Label className="text-sm">Days</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        const currentDays = newActivity.selectedDays;
                        const newDays = currentDays.includes(day.value)
                          ? currentDays.filter((d: string) => d !== day.value)
                          : [...currentDays, day.value];
                        setNewActivity((prev: any) => ({ ...prev, selectedDays: newDays }));
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        newActivity.selectedDays.includes(day.value)
                          ? "border-primary bg-card"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">{day.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Time of Day */}
              <div className="mb-6">
                <Label className="text-sm">Time of Day</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {TIME_OF_DAY_OPTIONS.map((time) => (
                    <button
                      key={time.value}
                      type="button"
                      onClick={() => setNewActivity((prev: any) => ({ ...prev, timeOfDay: time.value }))}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        newActivity.timeOfDay === time.value
                          ? "border-primary bg-card"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">{time.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Duration */}
              <div className="mb-6">
                <Label className="text-sm">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={newActivity.durationMinutes}
                  onChange={(e) => setNewActivity((prev: any) => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                  min="15"
                  max="300"
                  className="bg-card border-border mt-2"
                />
              </div>
              {/* Intensity */}
              <div className="mb-6">
                <Label className="text-sm">Intensity</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {INTENSITY_OPTIONS.map((intensity) => (
                    <button
                      key={intensity.value}
                      type="button"
                      onClick={() => setNewActivity((prev: any) => ({ ...prev, intensity: intensity.value }))}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        newActivity.intensity === intensity.value
                          ? "border-primary bg-card"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold text-sm">{intensity.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Notes */}
              <div className="mb-6">
                <Label className="text-sm">Notes (optional)</Label>
                <Input
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity((prev: any) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., Focus on legs, Bring water"
                  className="bg-card border-border mt-2"
                />
              </div>
            </div>
            {/* Save Button */}
            <div className="p-6 border-t border-border">
              <Button
                type="button"
                onClick={saveActivity}
                disabled={!newActivity.activityType || newActivity.selectedDays.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl text-lg disabled:opacity-50"
              >
                SAVE
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-4 items-center mt-6">
        <Button type="button" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {success && <span className="text-green-600">Schedule updated!</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </div>
  );
}

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // For animated indicator
  const tabIndex = TABS.findIndex(tab => tab.key === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center pt-4 pb-10 mb-20">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        {/* Enhanced Tab Bar with Icons and Animated Indicator */}
        <div className="relative flex items-center justify-between rounded-xl p-2 mb-2 shadow-sm border border-border overflow-hidden min-h-[64px]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                variant="ghost"
                className={`relative flex-1 rounded-lg transition-all duration-200 px-4 py-3 mx-1 font-semibold text-base flex flex-row items-center justify-center gap-2 group min-h-[48px]
                  ${isActive ? "text-primary" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"}
                `}
                style={{ zIndex: isActive ? 2 : 1, background: "transparent" }}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                <span>{tab.label}</span>
                {/* Simple underline for active tab */}
                {isActive && (
                  <span className="absolute left-2 right-2 -bottom-1 h-1 rounded-b-lg bg-primary transition-all duration-300" />
                )}
              </Button>
            );
          })}
        </div>
        <CardContent>
          {activeTab === "profile" && (
            <ProfileInfoForm />
          )}
          {activeTab === "schedule" && (
            <ProfileActivityScheduleForm />
          )}
          {activeTab === "password" && (
            <ChangePasswordForm />
          )}
          {activeTab === "support" && (
            <div className="flex flex-col items-center py-8">
              <h2 className="text-xl font-semibold mb-4 text-center">Contact the Fuelwarden Team for Support</h2>
              <p className="mb-6 text-center text-muted-foreground max-w-md">
                If you have any questions, issues, or need help, click the button below to email our support team. We’ll get back to you as soon as possible!
              </p>
              <a
                href="mailto:hello@fuelwarden.app?subject=Fuelwarden%20Support%20Request"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold transition-colors"
              >
                Contact Support
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 