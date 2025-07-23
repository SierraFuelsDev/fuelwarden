"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { databaseService, UserProfileForm, ActivityScheduleForm, ActivityScheduleItem } from "../../lib/database";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, User, Target, Calendar, Plus, Trash2, Trophy, Utensils, Dumbbell, Clock } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { ChevronsUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Form validation schemas for each step
const genderSchema = z.object({
  gender: z.enum(["male", "female", "other"]),
});

const dateOfBirthSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

const performanceObjectiveSchema = z.object({
  performanceObjective: z.enum(["in-season-peak", "off-season-build", "pre-season-cut", "maintain-recover", "not-sure"]),
});

const trainingCompetitionSchema = z.object({
  trainingCompetition: z.array(z.string()).min(1, "Select at least one activity").max(2, "Select up to 2 activities"),
});

const dietSchema = z.object({
  diet: z.array(z.string()).min(1, "Select at least one diet preference"),
});

const weeklyTrainingSchema = z.object({
  weeklyTraining: z.array(z.object({
    dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    timeOfDay: z.enum(["morning", "afternoon", "evening"]),
    activity: z.string().optional(),
    intensity: z.enum(["light", "moderate", "intense"]),
    durationMinutes: z.number().min(15, "Duration must be at least 15 minutes").max(300, "Duration must be less than 5 hours").optional(),
    notes: z.string().optional(),
  })).optional(),
});

const heightWeightSchema = z.object({
  heightWeight: z.object({
    heightFeet: z.number().min(3).max(7),
    heightInches: z.number().min(0).max(11),
    weightPounds: z.number().min(20).max(500), // Allow metric weights (20kg = ~44lbs)
    unitSystem: z.enum(["imperial", "metric"]),
  }),
});

const fullSchema = genderSchema
  .merge(dateOfBirthSchema)
  .merge(heightWeightSchema)
  .merge(performanceObjectiveSchema)
  .merge(trainingCompetitionSchema)
  .merge(dietSchema)
  .merge(weeklyTrainingSchema);

// Form data type
type OnboardingFormData = {
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  heightWeight: {
    heightFeet: number;
    heightInches: number;
    weightPounds: number;
    unitSystem: "imperial" | "metric";
  };
  performanceObjective: "in-season-peak" | "off-season-build" | "pre-season-cut" | "maintain-recover" | "not-sure";
  trainingCompetition: string[];
  diet: string[];
  weeklyTraining?: Array<{
    dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    timeOfDay: "morning" | "afternoon" | "evening";
    activity?: string;
    intensity: "light" | "moderate" | "intense";
    durationMinutes?: number;
    notes?: string;
  }>;
};

// Predefined options
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const PERFORMANCE_OBJECTIVE_OPTIONS = [
  { 
    value: "in-season-peak", 
    label: "In-Season Peak",
    description: "Maintain energy, recover fast, and perform consistently through your competitive phase."
  },
  { 
    value: "off-season-build", 
    label: "Off-Season Build",
    description: "Focus on gaining lean mass and training hard with strong fueling and recovery."
  },
  { 
    value: "pre-season-cut", 
    label: "Pre-Season Cut",
    description: "Trim body fat while keeping power and endurance high for pre-season readiness."
  },
  { 
    value: "maintain-recover", 
    label: "Maintain & Recover",
    description: "Stay fueled, reduce fatigue, and support consistent recovery during lighter phases."
  },
  { 
    value: "not-sure", 
    label: "Not Sure",
    description: "Let us build a balanced performance plan to get you started."
  },
];

const TRAINING_COMPETITION_OPTIONS = [
  { 
    value: "team_sports", 
    label: "Team Sports",
    description: "High energy output, frequent practices, performance + recovery balance (Football, Basketball, Soccer, etc)"
  },
  { 
    value: "combat_weight_class", 
    label: "Combat & Weight-Class Sports",
    description: "Precision nutrition, weight control, protein and recovery focus (Track & Field, Cross Country, Triathlon, etc)"
  },
  { 
    value: "endurance_sports", 
    label: "Endurance Sports",
    description: "Long-duration training, carbohydrate timing, hydration strategy (Track & Field, Cross Country, Triathlon, etc)"
  },
  { 
    value: "hybrid_functional", 
    label: "Hybrid / Functional Fitness",
    description: "Mixed intensity, variable workload, dynamic fueling needs (CrossFit, Hyrox, Obstacle Races, Tactical/Military Prep, etc)"
  },
  { 
    value: "general_fitness_aesthetics", 
    label: "General Fitness & Aesthetics",
    description: "Body composition goals, consistent habits, balanced macros (Bodybuilding, General Strength Training, etc)"
  },
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

const SUPPLEMENT_OPTIONS = [
  { value: "protein", label: "Protein Powder" },
  { value: "creatine", label: "Creatine" },
  { value: "bcaa", label: "BCAAs" },
  { value: "pre-workout", label: "Pre-Workout" },
  { value: "multivitamin", label: "Multivitamin" },
  { value: "omega3", label: "Omega-3" },
  { value: "vitamin-d", label: "Vitamin D" },
  { value: "none", label: "No Supplements" },
];

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

const DAYS_OPTIONS = [
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Everyday", label: "Everyday" },
];

interface OnboardingFormProps {
  onComplete: () => void;
  setIsOnboarding: (val: boolean) => void;
}

export function OnboardingForm({ onComplete, setIsOnboarding }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [day, setDay] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState("");
  const [activeField, setActiveField] = useState<"day" | "month" | "year" | "none">("day");
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(10);
  const [heightCm, setHeightCm] = useState<number>(178);
  const [heightCmInput, setHeightCmInput] = useState<string>("178");
  const [weightPounds, setWeightPounds] = useState<number>(180);
  const [weightInput, setWeightInput] = useState<string>("180");
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activityType: "",
    selectedDays: [] as string[],
    timeOfDay: "morning",
    intensity: "moderate",
    durationMinutes: 60,
    notes: ""
  });
  const [activeTimeField, setActiveTimeField] = useState<"from" | "to" | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const TOTAL_STEPS = 7;

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
      gender: "male" as "male" | "female" | "other",
      dateOfBirth: "",
      heightWeight: {
        heightFeet: 5,
        heightInches: 10,
        weightPounds: 180,
        unitSystem: "imperial" as "imperial" | "metric",
      },
      performanceObjective: "in-season-peak" as OnboardingFormData['performanceObjective'],
      trainingCompetition: [] as string[],
      diet: [] as string[],
      weeklyTraining: [] as OnboardingFormData['weeklyTraining'],
    },
    mode: "onSubmit",
  });

  const watchedValues = watch();

  const onSubmit = async (data: OnboardingFormData) => {
    if (currentStep !== TOTAL_STEPS) {
      return;
    }
    
    if (!user?.$id) {
      setSubmitError("No user ID available. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      console.log("[Onboarding] Starting submission for user:", user.$id);
      console.log("[Onboarding] Form data:", data);

      // Calculate age from date of birth
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

      // Calculate height in inches from the form data
      const heightInches = data.heightWeight.unitSystem === "imperial" 
        ? (data.heightWeight.heightFeet * 12) + data.heightWeight.heightInches
        : Math.round(data.heightWeight.heightFeet * 0.393701); // Convert cm to inches

      // Calculate weight in pounds from the form data
      const weightPounds = data.heightWeight.unitSystem === "imperial"
        ? data.heightWeight.weightPounds
        : Math.round(data.heightWeight.weightPounds * 2.20462); // Convert kg to pounds

      const profileData: Omit<UserProfileForm, "$id" | "$createdAt" | "$updatedAt"> = {
        userId: user.$id,
        age: actualAge,
        sex: data.gender,
        weightPounds: weightPounds,
        heightInches: heightInches,
        restrictions: [], // Not collected in onboarding - could be added later
        performanceObjective: data.performanceObjective,
        trainingCompetition: data.trainingCompetition,
        diet: data.diet,
        activitySchedule: (data.weeklyTraining && data.weeklyTraining.length > 0)
          ? data.weeklyTraining.map(item => JSON.stringify({
              dayOfWeek: item.dayOfWeek,
              timeOfDay: item.timeOfDay,
              activity: item.activity || "",
              intensity: item.intensity,
              durationMinutes: item.durationMinutes || 60,
              notes: item.notes || "",
            }))
          : [],
      };

      console.log("[Onboarding] Saving profile data:", profileData);
      await databaseService.createUserProfile(profileData);
      console.log("[Onboarding] Profile saved successfully");

      // No more activity schedule creation here

      // No more testOnboardingData verification here
      onComplete();
    } catch (error: any) {
      console.error("[Onboarding] Error submitting onboarding:", error);
      setSubmitError(error.message || "Failed to save your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsForCurrentStep = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsForCurrentStep);
    
    if (isStepValid && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof OnboardingFormData)[] => {
    switch (step) {
      case 1: return ["gender"];
      case 2: return ["dateOfBirth"];
      case 3: return ["heightWeight"];
      case 4: return ["performanceObjective"];
      case 5: return ["trainingCompetition"];
      case 6: return ["diet"];
      case 7: return ["weeklyTraining"];
      default: return [];
    }
  };

  const toggleArrayValue = (field: keyof OnboardingFormData, value: string) => {
    const currentValues = watchedValues[field] as string[] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field as any, newValues);
  };

  // Step 1: Gender
  const renderGenderStep = () => (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-white mb-3">Choose Your Gender</h2>
        <p className="text-gray-400 text-base">We use this to properly tailor you meal plans.</p>
      </div>
      
      <div className="space-y-4">
        {GENDER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setValue("gender", option.value as any)}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-center ${
              watchedValues.gender === option.value
                ? "border-primary bg-card"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="text-white font-semibold text-lg">{option.label}</div>
          </button>
        ))}
      </div>
      
      {errors.gender && (
        <p className="text-red-400 text-sm text-center">{errors.gender.message}</p>
      )}
    </div>
  );

  // Step 2: Date of Birth
  const renderDateOfBirthStep = () => {
    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    const maxYear = currentYear;

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" }
    ];

    const handleYearChange = (value: string) => {
      // Allow typing any numeric input, but validate when complete
      if (value === "" || /^\d{0,4}$/.test(value)) {
        setYear(value);
      }
    };

    const isValidDate = () => {
      if (!month || !year) return false;
      
      const yearNum = parseInt(year);
      const monthNum = month;
      
      // Check if it's a valid year and month combination
      return yearNum >= minYear && yearNum <= maxYear && monthNum >= 1 && monthNum <= 12;
    };

    const formatDate = () => {
      if (month && year && isValidDate()) {
        const formattedMonth = month.toString().padStart(2, '0');
        // Use the first day of the month as default
        return `${year}-${formattedMonth}-01`;
      }
      return "";
    };

    return (
      <div className="space-y-6">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white mb-3">Date Of Birth</h2>
          <p className="text-gray-400 text-base">We use this to determine your age in order to customize your plan.</p>
        </div>
        
        {/* Date Input Fields */}
        <div className="flex justify-center space-x-6 mb-8">
          {/* Month Selector */}
          <div className="w-32">
            <div className="text-center mb-2">
              <span className="text-white text-sm">Month</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setActiveField(activeField === "month" ? "none" : "month")}
                className="w-full h-12 bg-card border border-border rounded-lg flex items-center justify-between px-3 hover:border-primary transition-colors"
              >
                <span className="text-white text-lg font-medium">
                  {month ? months.find(m => m.value === month)?.label || "MM" : "MM"}
                </span>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeField === "month" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg max-h-32 overflow-y-auto z-10">
                  {months.map((m) => (
                    <div
                      key={m.value}
                      onClick={() => {
                        setMonth(m.value);
                        setActiveField("none");
                      }}
                      className={`px-3 py-2 text-center cursor-pointer transition-colors ${
                        month === m.value
                          ? "bg-primary text-primary-foreground"
                          : "text-card-foreground hover:bg-accent"
                      }`}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Year Input */}
          <div className="w-24">
            <div className="text-center mb-2">
              <span className="text-white text-sm">Year</span>
            </div>
            <input
              type="number"
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              placeholder="YYYY"
              className="w-full h-12 bg-card border border-border rounded-lg text-card-foreground text-center text-lg font-medium focus:border-primary focus:outline-none"
              min={minYear}
              max={maxYear}
            />
          </div>
        </div>

        {errors.dateOfBirth && (
          <p className="text-red-400 text-sm text-center">{errors.dateOfBirth.message}</p>
        )}
      </div>
    );
  };

  // Step 3: Height & Weight
  const renderHeightWeightStep = () => {
    const feet = Array.from({ length: 5 }, (_, i) => i + 3); // 3-7 feet
    const inches = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches

    // Conversion functions
    const poundsToKg = (lbs: number) => Math.round(lbs * 0.453592);
    const kgToPounds = (kg: number) => Math.round(kg / 0.453592);
    const feetToCm = (feet: number, inches: number) => Math.round((feet * 12 + inches) * 2.54);
    const cmToFeet = (cm: number) => {
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return { feet, inches };
    };

    const handleWeightChange = (value: string) => {
      if (value === "" || /^\d{0,3}$/.test(value)) {
        setWeightInput(value);
        const numValue = parseInt(value) || 0;
        if (unitSystem === "imperial") {
          setWeightPounds(numValue);
          setValue("heightWeight.weightPounds", numValue);
        } else {
          const pounds = kgToPounds(numValue);
          setWeightPounds(pounds);
          setValue("heightWeight.weightPounds", pounds);
        }
      }
    };

    const handleHeightCmChange = (value: string) => {
      if (value === "" || /^\d{0,3}$/.test(value)) {
        setHeightCmInput(value);
        const numValue = parseInt(value) || 0;
        if (numValue >= 100 && numValue <= 250) { // Reasonable height range in cm
          setHeightCm(numValue);
          const feetInches = cmToFeet(numValue);
          setHeightFeet(feetInches.feet);
          setHeightInches(feetInches.inches);
          setValue("heightWeight.heightFeet", feetInches.feet);
          setValue("heightWeight.heightInches", feetInches.inches);
        }
      }
    };

    const handleUnitSystemChange = () => {
      if (unitSystem === "imperial") {
        // Convert from imperial to metric
        const kg = poundsToKg(weightPounds);
        setWeightInput(kg.toString());
        const cm = feetToCm(heightFeet, heightInches);
        setHeightCmInput(cm.toString());
        setHeightCm(cm);
        setUnitSystem("metric");
        setValue("heightWeight.unitSystem", "metric");
      } else {
        // Convert from metric to imperial
        const lbs = kgToPounds(parseInt(weightInput) || 0);
        setWeightInput(lbs.toString());
        setWeightPounds(lbs);
        const feetInches = cmToFeet(heightCm);
        setHeightFeet(feetInches.feet);
        setHeightInches(feetInches.inches);
        setUnitSystem("imperial");
        setValue("heightWeight.unitSystem", "imperial");
        setValue("heightWeight.weightPounds", lbs);
        setValue("heightWeight.heightFeet", feetInches.feet);
        setValue("heightWeight.heightInches", feetInches.inches);
      }
    };

    const getCurrentWeight = () => {
      if (unitSystem === "imperial") {
        return weightPounds;
      } else {
        return poundsToKg(weightPounds);
      }
    };

    const getCurrentHeight = () => {
      if (unitSystem === "imperial") {
        return { feet: heightFeet, inches: heightInches };
      } else {
        const cm = feetToCm(heightFeet, heightInches);
        return { cm };
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white mb-3">Height & Weight</h2>
          <p className="text-gray-400 text-base">This will be used to calibrate your custom plan</p>
        </div>
        
        {/* Height Section */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-white font-bold text-lg">HEIGHT</span>
          </div>
          {unitSystem === "imperial" ? (
            <div className="flex justify-center space-x-4">
              {/* Feet */}
              <div className="w-20">
                <div className="h-32 overflow-y-auto bg-[#191919] border border-[#444] rounded-lg">
                  {feet.map((f) => (
                    <div
                      key={f}
                      onClick={() => {
                        setHeightFeet(f);
                        setValue("heightWeight.heightFeet", f);
                      }}
                      className={`px-3 py-2 text-center cursor-pointer transition-colors ${
                        heightFeet === f
                          ? "bg-[#333] text-white rounded"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {f} ft
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Inches */}
              <div className="w-20">
                <div className="h-32 overflow-y-auto bg-[#191919] border border-[#444] rounded-lg">
                  {inches.map((i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setHeightInches(i);
                        setValue("heightWeight.heightInches", i);
                      }}
                      className={`px-3 py-2 text-center cursor-pointer transition-colors ${
                        heightInches === i
                          ? "bg-[#333] text-white rounded"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {i} in
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-32">
                <input
                  type="number"
                  value={heightCmInput}
                  onChange={(e) => handleHeightCmChange(e.target.value)}
                  placeholder="cm"
                  className="w-full h-12 bg-[#191919] border border-[#444] rounded-lg text-white text-center text-lg font-medium focus:border-[#FF5001] focus:outline-none"
                  min={100}
                  max={250}
                />
                <div className="text-center mt-2">
                  <span className="text-gray-400 text-sm">cm</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weight Section */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-white font-bold text-lg">WEIGHT</span>
          </div>
          <div className="flex justify-center">
            <div className="w-32">
              <input
                type="number"
                value={weightInput}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder={unitSystem === "imperial" ? "lbs" : "kg"}
                className="w-full h-12 bg-[#191919] border border-[#444] rounded-lg text-white text-center text-lg font-medium focus:border-[#FF5001] focus:outline-none"
                min={unitSystem === "imperial" ? 50 : 20}
                max={unitSystem === "imperial" ? 500 : 227}
              />
              <div className="text-center mt-2">
                <span className="text-gray-400 text-sm">
                  {unitSystem === "imperial" ? "lbs" : "kg"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Toggle */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            <span className={`text-sm ${unitSystem === "imperial" ? "text-white" : "text-gray-400"}`}>
              IMPERIAL
            </span>
            <button
              onClick={handleUnitSystemChange}
              className="relative w-12 h-6 bg-[#333] rounded-full transition-colors"
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  unitSystem === "imperial" ? "left-1" : "right-1"
                }`}
              />
            </button>
            <span className={`text-sm ${unitSystem === "metric" ? "text-white" : "text-gray-400"}`}>
              METRIC
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Step 4: Performance Objective
  const renderPerformanceObjectiveStep = () => (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-white mb-3">Performance Objective</h2>
        <p className="text-gray-400 text-base">We use this to determine your age in order to customize your plan.</p>
      </div>
      
      <div className="space-y-4">
        {PERFORMANCE_OBJECTIVE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setValue("performanceObjective", option.value as any)}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              watchedValues.performanceObjective === option.value
                ? "border-primary bg-card"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="text-white font-semibold text-lg mb-2">{option.label}</div>
            <div className="text-gray-400 text-sm">{option.description}</div>
          </button>
        ))}
      </div>
      
      {errors.performanceObjective && (
        <p className="text-red-400 text-sm text-center">{errors.performanceObjective.message}</p>
      )}
    </div>
  );

  // Step 5: Training/Competition
  const renderTrainingCompetitionStep = () => (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-white mb-3">What Do You Train Or Compete For?</h2>
        <p className="text-gray-400 text-base">Select the training category that best matches your current routine or competitive focus.</p>
      </div>
      
      <div className="space-y-4">
        {TRAINING_COMPETITION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleArrayValue("trainingCompetition", option.value)}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              (watchedValues.trainingCompetition || []).includes(option.value)
                ? "border-primary bg-card"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="text-white font-semibold text-lg mb-2">{option.label}</div>
            <div className="text-gray-400 text-sm">{option.description}</div>
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-white text-sm">Select up to two</p>
      </div>
      
      {errors.trainingCompetition && (
        <p className="text-red-400 text-sm text-center">{errors.trainingCompetition.message}</p>
      )}
    </div>
  );

  // Step 6: Diet
  const renderDietStep = () => (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-2xl font-bold text-white mb-3">Select Your Typical Diet</h2>
        <p className="text-gray-400 text-base">Choose the dietary style or restrictions you usually follow. This helps us recommend meals that fit your needs.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {DIET_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleArrayValue("diet", option.value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
              (watchedValues.diet || []).includes(option.value)
                ? "border-primary bg-card"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="text-white font-medium text-sm">{option.label}</div>
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-white text-sm">You can select multiple options.</p>
      </div>
      
      {errors.diet && (
        <p className="text-red-400 text-sm text-center">{errors.diet.message}</p>
      )}
    </div>
  );

  // Step 7: Weekly Training
  const renderWeeklyTrainingStep = () => {
    const addActivity = () => {
      setShowActivityModal(true);
    };

    const saveActivity = () => {
      if (newActivity.activityType && newActivity.selectedDays.length > 0) {
        const currentSchedule = watchedValues.weeklyTraining || [];
        const newActivities = newActivity.selectedDays.map(day => ({
          dayOfWeek: day as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
          timeOfDay: newActivity.timeOfDay as "morning" | "afternoon" | "evening",
          activity: newActivity.activityType,
          intensity: newActivity.intensity as "light" | "moderate" | "intense",
          durationMinutes: newActivity.durationMinutes || 60,
          notes: newActivity.notes || "",
        }));
        
        setValue("weeklyTraining", [...currentSchedule, ...newActivities]);
        setNewActivity({
          activityType: "",
          selectedDays: [],
          timeOfDay: "morning",
          intensity: "moderate",
          durationMinutes: 60,
          notes: ""
        });
        setShowActivityModal(false);
      }
    };

    const removeActivity = (index: number) => {
      const currentSchedule = watchedValues.weeklyTraining || [];
      setValue("weeklyTraining", currentSchedule.filter((_, i) => i !== index));
    };

    const updateActivity = (index: number, field: string, value: any) => {
      const currentSchedule = watchedValues.weeklyTraining || [];
      const updatedSchedule = currentSchedule.map((activity, i) =>
        i === index ? { ...activity, [field]: value } : activity
      );
      setValue("weeklyTraining", updatedSchedule);
    };

    // Helper function to get time range string
    const getTimeRange = (timeOfDay: string) => {
      switch (timeOfDay) {
        case "morning":
          return "Morning (6AM-12PM)";
        case "afternoon":
          return "Afternoon (12PM-6PM)";
        case "evening":
          return "Evening (6PM-12AM)";
        default:
          return "Morning (6AM-12PM)";
      }
    };

    // Helper function to get intensity color
    const getIntensityColor = (intensity: string) => {
      switch (intensity) {
        case "intense":
          return "bg-red-800 text-white";
        case "moderate":
          return "bg-yellow-800 text-white";
        case "light":
          return "bg-green-800 text-white";
        default:
          return "bg-gray-800 text-white";
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white mb-3">Weekly Training Schedule</h2>
          <p className="text-gray-400 text-base">Set up your weekly training routine to help us optimize your meal timing.</p>
        </div>

        {/* Add Activity Button */}
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

        {/* Current Activities */}
        <div className="space-y-6">
          {(() => {
            // Group activities by day
            const groupedActivities = (watchedValues.weeklyTraining || []).reduce((acc, activity, index) => {
              if (!acc[activity.dayOfWeek]) {
                acc[activity.dayOfWeek] = [];
              }
              acc[activity.dayOfWeek].push({ ...activity, originalIndex: index });
              return acc;
            }, {} as Record<string, any[]>);

            // Sort days in chronological order
            const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            return dayOrder.map(day => {
              const dayActivities = groupedActivities[day] || [];
              
              return (
                <div key={day} className="space-y-3">
                  <h3 className="text-white font-bold text-lg">{day}</h3>
                  {dayActivities.length > 0 ? (
                    <div className="space-y-3">
                      {dayActivities.map((activityWithIndex, index) => {
                        const { originalIndex, ...activity } = activityWithIndex;
                        
                        return (
                          <div key={`${day}-${index}`} className="bg-card border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="text-white font-medium mb-2">
                                  {ACTIVITY_TYPE_OPTIONS.find(opt => opt.value === activity.activity)?.label || activity.activity}
                                </div>
                                <div className="text-gray-400 text-sm mb-2">
                                  {getTimeRange(activity.timeOfDay)} • {activity.durationMinutes} minutes
                                </div>
                                {activity.notes && (
                                  <div className="text-gray-400 text-sm">"{activity.notes}"</div>
                                )}
                              </div>
                              <button
                                onClick={() => removeActivity(originalIndex)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-gray-400 text-sm">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {getTimeRange(activity.timeOfDay)}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${getIntensityColor(activity.intensity)}`}>
                                {activity.intensity}
                              </span>
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
            });
          })()}
        </div>

        {/* Activity Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-lg">Add Activity</h3>
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Activity Type */}
                <div className="mb-6">
                  <Label className="text-white text-sm">Activity Type</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {ACTIVITY_TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setNewActivity(prev => ({ ...prev, activityType: option.value }))}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                          newActivity.activityType === option.value
                            ? "border-primary bg-card"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <div className="text-white font-semibold text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days Selection */}
                <div className="mb-6">
                  <Label className="text-white text-sm">Days</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const currentDays = newActivity.selectedDays;
                          const newDays = currentDays.includes(day.value)
                            ? currentDays.filter(d => d !== day.value)
                            : [...currentDays, day.value];
                          setNewActivity(prev => ({ ...prev, selectedDays: newDays }));
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                          newActivity.selectedDays.includes(day.value)
                            ? "border-primary bg-card"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <div className="text-white font-semibold text-sm">{day.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time of Day */}
                <div className="mb-6">
                  <Label className="text-white text-sm">Time of Day</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {TIME_OF_DAY_OPTIONS.map((time) => (
                      <button
                        key={time.value}
                        type="button"
                        onClick={() => setNewActivity(prev => ({ ...prev, timeOfDay: time.value }))}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                          newActivity.timeOfDay === time.value
                            ? "border-primary bg-card"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <div className="text-white font-semibold text-sm">{time.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-6">
                  <Label className="text-white text-sm">Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newActivity.durationMinutes}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                    min="15"
                    max="300"
                    className="bg-card border-border text-white mt-2"
                  />
                </div>

                {/* Intensity */}
                <div className="mb-6">
                  <Label className="text-white text-sm">Intensity</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {INTENSITY_OPTIONS.map((intensity) => (
                      <button
                        key={intensity.value}
                        type="button"
                        onClick={() => setNewActivity(prev => ({ ...prev, intensity: intensity.value }))}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                          newActivity.intensity === intensity.value
                            ? "border-primary bg-card"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <div className="text-white font-semibold text-sm">{intensity.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <Label className="text-white text-sm">Notes (optional)</Label>
                  <Input
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="e.g., Focus on legs, Bring water"
                    className="bg-card border-border text-white mt-2"
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
      </div>
    );
  };

  const getStepInfo = (step: number) => {
    switch (step) {
      case 1:
        return {
          title: "Gender",
          description: "Tell us about yourself",
          icon: User,
          color: "text-blue-400"
        };
      case 2:
        return {
          title: "Date of Birth",
          description: "Help us calculate your needs",
          icon: Calendar,
          color: "text-green-400"
        };
      case 3:
        return {
          title: "Height & Weight",
          description: "Calibrate your custom plan",
          icon: Target,
          color: "text-purple-400"
        };
      case 4:
        return {
          title: "Performance Objective",
          description: "What are you trying to achieve?",
          icon: Target,
          color: "text-purple-400"
        };
      case 5:
        return {
          title: "Training & Competition",
          description: "What do you train or compete for?",
          icon: Trophy,
          color: "text-yellow-400"
        };
      case 6:
        return {
          title: "Diet Preferences",
          description: "Set your diet preferences",
          icon: Utensils,
          color: "text-orange-400"
        };
      case 7:
        return {
          title: "Weekly Training",
          description: "Set your weekly training schedule",
          icon: Dumbbell,
          color: "text-red-400"
        };
      default:
        return { title: "", description: "", icon: User, color: "" };
    }
  };

  const stepInfo = getStepInfo(currentStep);
  const IconComponent = stepInfo.icon;

  useEffect(() => {
    setIsOnboarding(true);
    return () => setIsOnboarding(false);
  }, [setIsOnboarding]);

  // Update the form value when date fields are complete
  useEffect(() => {
    const formatDate = () => {
      if (month && year) {
        const formattedMonth = month.toString().padStart(2, '0');
        // Use the first day of the month as default
        return `${year}-${formattedMonth}-01`;
      }
      return "";
    };

    const dateString = formatDate();
    if (dateString) {
      setValue("dateOfBirth", dateString);
    }
  }, [month, year, setValue]);

  // Update the form value when height/weight fields change
  useEffect(() => {
    setValue("heightWeight", {
      heightFeet,
      heightInches,
      weightPounds,
      unitSystem,
    });
  }, [heightFeet, heightInches, weightPounds, unitSystem, setValue]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo at top center */}
      <div className="flex justify-center pt-8 pb-4">
        <button
          onClick={() => window.location.href = 'https://www.fuelwarden.app'}
          className="hover:opacity-80 transition-opacity cursor-pointer"
        >
          <img src="/logo-1.svg" alt="FuelWarden" className="h-8" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-foreground font-medium">Step {currentStep}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Dark gray card container */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              {currentStep > 1 ? (
                <button
                  onClick={prevStep}
                  className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="#FF5001" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ) : (
                <div className="w-10"></div>
              )}
              <span className="text-foreground font-medium">Step {currentStep}</span>
              <div className="w-10"></div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/50 text-red-400">
                {submitError}
              </div>
            )}
            
            <form onSubmit={e => e.preventDefault()} className="space-y-8">
              {currentStep === 1 && renderGenderStep()}
              {currentStep === 2 && renderDateOfBirthStep()}
              {currentStep === 3 && renderHeightWeightStep()}
              {currentStep === 4 && renderPerformanceObjectiveStep()}
              {currentStep === 5 && renderTrainingCompetitionStep()}
              {currentStep === 6 && renderDietStep()}
              {currentStep === 7 && renderWeeklyTrainingStep()}
              
              {/* Continue/Complete Button */}
              <Button
                type="button"
                onClick={currentStep < TOTAL_STEPS ? nextStep : () => handleSubmit(onSubmit)()}
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl text-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : currentStep < TOTAL_STEPS ? (
                  "CONTINUE"
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}