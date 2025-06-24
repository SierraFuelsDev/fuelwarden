"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { databaseService, UserProfile } from "../../lib/database";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useRouter } from "next/navigation";

// Form validation schemas for each step
const basicInfoSchema = z.object({
  age: z.number().min(13, "Age must be at least 13").max(120, "Age must be less than 120"),
  sex: z.enum(["male", "female", "other"]),
  weightPounds: z.number().min(50, "Weight must be at least 50 lbs").max(500, "Weight must be less than 500 lbs"),
  heightInches: z.number().min(48, "Height must be at least 48 inches").max(96, "Height must be less than 96 inches"),
});

const scheduleSchema = z.object({
  wakeupTime: z.string().optional(),
  bedTime: z.string().optional(),
});

const preferencesSchema = z.object({
  restrictions: z.array(z.string()),
  preferences: z.array(z.string()),
  goals: z.array(z.string()),
  activities: z.array(z.string()),
  supplements: z.array(z.string()),
});

const fullSchema = basicInfoSchema.merge(scheduleSchema).merge(preferencesSchema);

type OnboardingFormData = z.infer<typeof fullSchema>;

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

interface OnboardingFormProps {
  onComplete: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      restrictions: [],
      preferences: [],
      goals: [],
      activities: [],
      supplements: [],
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user?.$id) {
      console.error("No user ID available");
      return;
    }

    setIsSubmitting(true);
    try {
      const profileData: Omit<UserProfile, "$id" | "$createdAt" | "$updatedAt"> = {
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
        supplements: data.supplements,
      };

      await databaseService.createUserProfile(profileData);
      onComplete();
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleArrayValue = (field: keyof OnboardingFormData, value: string) => {
    const currentValues = watchedValues[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field, newValues);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
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
              className="bg-[#1c1c1e] border-[#444] text-white"
              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
            />
          )}
        />
        {errors.heightInches && <p className="text-red-400 text-sm mt-1">{errors.heightInches.message}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
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
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white">Dietary Restrictions</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
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
        <div className="grid grid-cols-2 gap-2 mt-2">
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
        <div className="grid grid-cols-2 gap-2 mt-2">
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
        <div className="grid grid-cols-2 gap-2 mt-2">
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

      <div>
        <Label className="text-white">Supplements</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {SUPPLEMENT_OPTIONS.map((option) => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={watchedValues.supplements?.includes(option)}
                onChange={() => toggleArrayValue("supplements", option)}
                className="text-[#ff8e01] bg-[#1c1c1e] border-[#444]"
              />
              <span className="text-white text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Basic Information";
      case 2: return "Daily Schedule";
      case 3: return "Preferences & Goals";
      default: return "";
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return "Tell us about yourself";
      case 2: return "Help us understand your daily rhythm";
      case 3: return "Customize your experience";
      default: return "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{getStepTitle(currentStep)}</h2>
          <span className="text-gray-400">Step {currentStep} of 3</span>
        </div>
        <p className="text-gray-400">{getStepDescription(currentStep)}</p>
        
        {/* Progress bar */}
        <div className="w-full bg-[#1c1c1e] rounded-full h-2 mt-4">
          <div 
            className="bg-[#ff8e01] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      <Card className="bg-[#232325] border-[#333]">
        <CardHeader>
          <CardTitle className="text-white">{getStepTitle(currentStep)}</CardTitle>
          <CardDescription className="text-gray-400">
            {getStepDescription(currentStep)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-[#444] text-white hover:bg-[#333]"
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#ff8e01] hover:bg-[#ff9e2b] text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="bg-[#ff8e01] hover:bg-[#ff9e2b] text-white disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 