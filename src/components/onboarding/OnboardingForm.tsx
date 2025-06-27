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
import { Check, ChevronLeft, ChevronRight, User, Clock, Target } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { ChevronsUpDown } from "lucide-react";

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

const activitiesSchema = z.object({
  activities: z.array(z.string()).min(1, "Select at least one activity").max(3, "Select up to 3 activities")
});

const goalsSchema = z.object({
  goals: z.array(z.string()).min(1, "Select at least one goal").max(3, "Select up to 3 goals")
});

const dietarySchema = z.object({
  restrictions: z.array(z.string()),
});

const foodPreferencesSchema = z.object({
  preferences: z.array(z.string()),
});

const fullSchema = basicInfoSchema
  .merge(scheduleSchema)
  .merge(activitiesSchema)
  .merge(goalsSchema)
  .merge(dietarySchema)
  .merge(foodPreferencesSchema);

type OnboardingFormData = {
  age: number;
  sex: "male" | "female" | "other";
  weightPounds: number;
  heightInches: number;
  wakeupTime?: string;
  bedTime?: string;
  activities: string[];
  goals: string[];
  restrictions: string[];
  preferences: string[];
};

// Predefined options for multi-select fields
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
  { value: "meal-prep", label: "Meal prep friendly" },
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
  { value: "strength_training", label: "Strength Training (e.g., Weightlifting, Powerlifting)" },
  { value: "high_intensity", label: "High-Intensity Training (e.g., CrossFit, HIIT)" },
  { value: "endurance", label: "Endurance Cardio (e.g., Running, Cycling, Rowing)" },
  { value: "team_sports", label: "Team Sports (e.g., Soccer, Basketball, Hockey)" },
  { value: "combat_sports", label: "Combat Sports (e.g., MMA, Boxing, Wrestling)" },
  { value: "recreational", label: "Recreational Movement (e.g., Hiking, Pickleball)" },
  { value: "mobility_focus", label: "Mobility/Recovery Focused (e.g., Yoga, Pilates)" },
  { value: "other", label: "Other or Custom Routine" }
];

interface OnboardingFormProps {
  onComplete: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      age: 0,
      sex: "male" as "male" | "female" | "other",
      weightPounds: 0,
      heightInches: 0,
      wakeupTime: "",
      bedTime: "",
      restrictions: [] as string[],
      preferences: [] as string[],
      goals: [] as string[],
      activities: [] as string[],
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user?.$id) {
      setSubmitError("No user ID available. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    
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
      };

      await databaseService.upsertUserProfile(profileData);
      onComplete();
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      setSubmitError(error.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const TOTAL_STEPS = 6;
  const getFieldsForStep = (step: number): (keyof OnboardingFormData)[] => {
    switch (step) {
      case 1:
        return ["age", "sex", "weightPounds", "heightInches"];
      case 2:
        return ["wakeupTime", "bedTime"];
      case 3:
        return ["activities"];
      case 4:
        return ["goals"];
      case 5:
        return ["restrictions"];
      case 6:
        return ["preferences"];
      default:
        return [];
    }
  };

  const toggleArrayValue = (field: keyof OnboardingFormData, value: string) => {
    const currentValues: string[] = Array.isArray(watchedValues[field]) ? watchedValues[field].map(String) : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setValue(field, newValues);
  };

  const renderStep1 = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Label htmlFor="age" className="text-white font-medium">Age</Label>
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
                className="bg-[#1c1c1e] border-[#444] text-white mt-2"
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
          {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age.message}</p>}
        </div>

        <div>
          <Label className="text-white font-medium">Sex</Label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Label htmlFor="weight" className="text-white font-medium">Weight (pounds)</Label>
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
                className="bg-[#1c1c1e] border-[#444] text-white mt-2"
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
          {errors.weightPounds && <p className="text-red-400 text-sm mt-1">{errors.weightPounds.message}</p>}
        </div>

        <div>
          <Label htmlFor="height" className="text-white font-medium">Height (inches)</Label>
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
                className="bg-[#1c1c1e] border-[#444] text-white mt-2"
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
          {errors.heightInches && <p className="text-red-400 text-sm mt-1">{errors.heightInches.message}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-400">This helps us understand your daily rhythm for better meal timing</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="wakeupTime" className="text-white font-medium">Wake-up Time (optional)</Label>
          <Controller
            name="wakeupTime"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="time"
                id="wakeupTime"
                className="bg-[#1c1c1e] border-[#444] text-white mt-2"
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="bedTime" className="text-white font-medium">Bed Time (optional)</Label>
          <Controller
            name="bedTime"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="time"
                id="bedTime"
                className="bg-[#1c1c1e] border-[#444] text-white mt-2"
              />
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderActivitiesStep = () => {
    return renderCombobox("activities", ACTIVITY_OPTIONS, "What types of activities do you like to do?", "Select up to 3 activities");
  };

  const renderGoalsStep = () => {
    const goalsArr: string[] = Array.isArray(watchedValues.goals) ? watchedValues.goals.map(String) : [];
    return (
      <div>
        <Label className="text-white font-medium mb-3 block text-lg">What are your main goals?</Label>
        <p className="text-gray-400 mb-4 sm:mb-6">Select all that apply.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {GOAL_OPTIONS.map((option) => {
            const selected = goalsArr.includes(String(option.value));
            return (
              <button
                key={option.value}
                type="button"
                className={`flex items-center justify-start p-3 sm:p-4 rounded-xl border transition-colors text-white font-medium text-sm sm:text-base h-14 sm:h-16 shadow-sm
                  ${selected ? "bg-[#ff8e01] border-[#ff8e01] text-white" : "bg-[#232325] border-[#444] hover:border-[#ff8e01]"}
                `}
                onClick={() => toggleArrayValue("goals", String(option.value))}
              >
                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-colors
                  ${selected 
                    ? "bg-white border-white" 
                    : "border-[#666] bg-transparent"
                  }`}
                >
                  {selected && (
                    <svg className="w-2.5 h-2.5 text-[#ff8e01]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
        {errors.goals && <p className="text-red-400 text-sm mt-2">{errors.goals.message}</p>}
      </div>
    );
  };

  const renderDietaryStep = () => {
    const restrictionsArr: string[] = Array.isArray(watchedValues.restrictions) ? watchedValues.restrictions.map(String) : [];
    return (
      <div>
        <Label className="text-white font-medium mb-3 block text-lg">Do you have any dietary restrictions?</Label>
        <p className="text-gray-400 mb-4 sm:mb-6">Select all that apply.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {RESTRICTION_OPTIONS.map((option) => {
            const selected = restrictionsArr.includes(String(option.value));
            return (
              <button
                key={option.value}
                type="button"
                className={`flex items-center justify-start p-3 sm:p-4 rounded-xl border transition-colors text-white font-medium text-sm sm:text-base h-14 sm:h-16 shadow-sm
                  ${selected ? "bg-[#ff8e01] border-[#ff8e01] text-white" : "bg-[#232325] border-[#444] hover:border-[#ff8e01]"}
                `}
                onClick={() => toggleArrayValue("restrictions", String(option.value))}
              >
                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-colors
                  ${selected 
                    ? "bg-white border-white" 
                    : "border-[#666] bg-transparent"
                  }`}
                >
                  {selected && (
                    <svg className="w-2.5 h-2.5 text-[#ff8e01]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
        {errors.restrictions && <p className="text-red-400 text-sm mt-2">{errors.restrictions.message}</p>}
      </div>
    );
  };

  const renderCombobox = (field: string, options: { value: string; label: string }[], label: string, placeholder: string) => {
    const raw = watchedValues[field as keyof OnboardingFormData];
    const selected: string[] = Array.isArray(raw) ? raw.map(String) : [];
    const searchTerm = searchTerms[field] || "";
    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue: string) => {
      if (selected.includes(String(optionValue))) {
        setValue(field as keyof OnboardingFormData, selected.filter((v) => String(v) !== String(optionValue)));
      } else {
        setValue(field as keyof OnboardingFormData, [...selected, String(optionValue)]);
      }
    };

    return (
      <div>
        <Label className="text-white font-medium mb-3 block text-lg">{label}</Label>
        <p className="text-gray-400 mb-4 sm:mb-6">Select up to 3 options.</p>
        <Popover>
          <PopoverTrigger asChild>
            <div
              className="w-full min-h-[48px] flex flex-wrap items-center gap-2 bg-[#1c1c1e] border border-[#444] rounded-md px-3 py-2 cursor-pointer focus-within:border-[#ff8e01] focus-within:ring-[#ff8e01] hover:border-[#ff8e01]"
              tabIndex={0}
              role="combobox"
              aria-expanded="false"
            >
              {selected.length === 0 && (
                <span className="text-gray-400 select-none">{placeholder}</span>
              )}
              {selected.map((value) => {
                const option = options.find((o) => o.value === value);
                return (
                  <div
                    key={value}
                    className="flex items-center gap-2 bg-[#ff8e01] text-white px-3 py-1 rounded-full text-sm mb-1"
                  >
                    <span>{option?.label}</span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setValue(field as keyof OnboardingFormData, selected.filter((v) => v !== value));
                      }}
                      className="hover:bg-[#ff9e2b] rounded-full p-1"
                      tabIndex={-1}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#232325] border-[#444] shadow-xl max-h-[300px]">
            <div className="p-2">
              <Input
                placeholder={`Search ${label.toLowerCase()}...`}
                className="h-10 bg-[#1c1c1e] border-[#444] text-white placeholder:text-gray-400 focus:border-[#ff8e01] focus:ring-[#ff8e01] mb-2"
                value={searchTerm}
                onChange={e => setSearchTerms(prev => ({ ...prev, [field]: e.target.value }))}
              />
              <div className="max-h-[250px] overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="text-gray-400 py-4 text-center">No options found.</div>
                ) : (
                  <div className="space-y-1">
                    {filteredOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`w-full text-left px-3 py-2 rounded-md text-white hover:bg-[#1c1c1e] focus:bg-[#1c1c1e] cursor-pointer flex items-center ${
                          selected.includes(String(option.value)) ? 'bg-[#ff8e01] text-white' : ''
                        }`}
                        onClick={() => handleSelect(option.value)}
                      >
                        <Check
                          className={
                            selected.includes(String(option.value))
                              ? "mr-3 h-4 w-4 opacity-100 text-white"
                              : "mr-3 h-4 w-4 opacity-0"
                          }
                        />
                        <span className="flex-1">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {errors[field as keyof OnboardingFormData] && (
          <p className="text-red-400 text-sm mt-2">{errors[field as keyof OnboardingFormData]?.message}</p>
        )}
      </div>
    );
  };

  const renderFoodPreferencesStep = () => {
    const preferencesArr: string[] = Array.isArray(watchedValues.preferences) ? watchedValues.preferences.map(String) : [];
    return (
      <div>
        <Label className="text-white font-medium mb-3 block text-lg">What are your food preferences?</Label>
        <p className="text-gray-400 mb-4 sm:mb-6">Select all that apply.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {PREFERENCE_OPTIONS.map((option) => {
            const selected = preferencesArr.includes(String(option.value));
            return (
              <button
                key={option.value}
                type="button"
                className={`flex items-center justify-start p-3 sm:p-4 rounded-xl border transition-colors text-white font-medium text-sm sm:text-base h-14 sm:h-16 shadow-sm
                  ${selected ? "bg-[#ff8e01] border-[#ff8e01] text-white" : "bg-[#232325] border-[#444] hover:border-[#ff8e01]"}
                `}
                onClick={() => toggleArrayValue("preferences", String(option.value))}
              >
                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-colors
                  ${selected 
                    ? "bg-white border-white" 
                    : "border-[#666] bg-transparent"
                  }`}
                >
                  {selected && (
                    <svg className="w-2.5 h-2.5 text-[#ff8e01]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
        {errors.preferences && <p className="text-red-400 text-sm mt-2">{errors.preferences.message}</p>}
      </div>
    );
  };

  const getStepInfo = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Basic Information",
          description: "Tell us about yourself",
          icon: User,
          color: "text-blue-400"
        };
      case 2:
        return {
          title: "Daily Schedule",
          description: "Help us understand your daily rhythm",
          icon: Clock,
          color: "text-green-400"
        };
      case 3:
        return {
          title: "Activities",
          description: "Tell us about your favorite activities",
          icon: Target,
          color: "text-purple-400"
        };
      case 4:
        return {
          title: "Goals",
          description: "Set your main goals",
          icon: Target,
          color: "text-purple-400"
        };
      case 5:
        return {
          title: "Dietary Restrictions",
          description: "Tell us about your dietary preferences",
          icon: Target,
          color: "text-purple-400"
        };
      case 6:
        return {
          title: "Food Preferences",
          description: "Tell us about your food preferences",
          icon: Target,
          color: "text-purple-400"
        };
      default:
        return { title: "", description: "", icon: User, color: "" };
    }
  };

  const stepInfo = getStepInfo(currentStep);
  const IconComponent = stepInfo.icon;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      {/* Progress indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-[#1c1c1e] ${stepInfo.color}`}>
              <IconComponent size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{stepInfo.title}</h2>
              <p className="text-gray-400 text-sm sm:text-base">{stepInfo.description}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-gray-400 text-sm">Step {currentStep} of {TOTAL_STEPS}</span>
            <div className="flex space-x-1 mt-2">
              {[...Array(TOTAL_STEPS)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-6 sm:w-8 rounded-full transition-all duration-300 ${
                    i + 1 <= currentStep ? "bg-[#ff8e01]" : "bg-[#1c1c1e]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Card className="bg-[#232325] border-[#333] shadow-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Error Message */}
          {submitError && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/50 text-red-400">
              {submitError}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderActivitiesStep()}
            {currentStep === 4 && renderGoalsStep()}
            {currentStep === 5 && renderDietaryStep()}
            {currentStep === 6 && renderFoodPreferencesStep()}
            <div className="flex flex-col sm:flex-row sm:justify-between pt-6 sm:pt-8 border-t border-[#444] space-y-4 sm:space-y-0">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                aria-disabled={currentStep === 1}
                className={`bg-[#2a2a2a] border-[#666] text-[#bbb] hover:bg-[#333] hover:border-[#ff8e01] min-w-[100px] w-full sm:w-auto ${currentStep === 1 ? 'cursor-not-allowed' : ''}`}
              >
                <ChevronLeft size={16} className="mr-2" />
                Previous
              </Button>
              {currentStep < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-[#ff8e01] hover:bg-[#ff9e2b] text-white w-full sm:w-auto"
                >
                  Next
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="bg-[#ff8e01] hover:bg-[#ff9e2b] text-white disabled:opacity-50 w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}