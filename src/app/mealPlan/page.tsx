"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { databaseService, ActivityScheduleItem } from "../../lib/database";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { FullPageSpinner } from "../../components/auth/LoadingSpinner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { 
  Clock, 
  Plus,
  Timer,
  AlertCircle,
  CheckCircle,
  Activity,
  Flame,
  Zap,
  Sun,
  Moon,
  Sunrise,
  ChevronRight,
  Target,
  Battery,
  Shield,
  Utensils,
  Lightbulb
} from "lucide-react";

// Time blocks mapping with proper icons
const TIME_BLOCKS = {
  morning: { start: 6, end: 12, label: "Morning", icon: Sunrise },
  afternoon: { start: 12, end: 18, label: "Afternoon", icon: Sun },
  evening: { start: 18, end: 24, label: "Evening", icon: Moon },
};

// Get current time info
function getCurrentTimeInfo() {
  const now = new Date();
  const hour = now.getHours();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = days[now.getDay()];
  
  let currentTimeBlock: "morning" | "afternoon" | "evening" = "morning";
  if (hour >= 6 && hour < 12) currentTimeBlock = "morning";
  else if (hour >= 12 && hour < 18) currentTimeBlock = "afternoon";
  else currentTimeBlock = "evening";
  
  return { currentDay, currentTimeBlock, hour };
}

// Generate week dates starting from today
function getWeekDates() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday
  const weekDates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDay + i);
    weekDates.push(date);
  }
  
  return weekDates;
}

// Format date for display
function formatDate(date: Date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = days[date.getDay()];
  const dayNumber = date.getDate();
  
  return { dayName, dayNumber };
}

export default function MealPlanPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const currentTimeBlockRef = useRef<HTMLDivElement>(null);

  // Mock user's macro targets and current logged amounts
  const [macroTargets] = useState({
    calories: 2400,
    protein: 180,
    carbs: 300,
    fat: 80
  });
  
  const [macroLogged] = useState({
    calories: 1650,
    protein: 125,
    carbs: 180,
    fat: 45
  });

  useEffect(() => {
    if (user?.$id) {
      loadWorkoutsForDate(selectedDate);
    }
  }, [user, selectedDate]);

  // Auto-scroll to current time block
  useEffect(() => {
    if (activities.length > 0 && currentTimeBlockRef.current) {
      setTimeout(() => {
        currentTimeBlockRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 500);
    }
  }, [activities]);

  const loadWorkoutsForDate = async (date: Date) => {
    if (!user?.$id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const profile = await databaseService.getUserProfile(user.$id);
      let workoutActivities: ActivityScheduleItem[] = [];
      
      if (profile && Array.isArray(profile.activitySchedule)) {
        workoutActivities = profile.activitySchedule
          .map(item => {
            try {
              return typeof item === "string" ? JSON.parse(item) : item;
            } catch {
              return null;
            }
          })
          .filter(Boolean) as ActivityScheduleItem[];
      }
      
      // Filter for selected date's activities
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const selectedDayName = days[date.getDay()];
      const dayActivities = workoutActivities.filter(
        activity => activity.dayOfWeek === selectedDayName
      );
      
      setActivities(dayActivities);
    } catch (err: any) {
      setError(err.message || "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced meal generation with detailed macros and examples
  const getWorkoutMeals = (activity: ActivityScheduleItem) => {
    if (activity.intensity === "intense") {
      return {
        pre: { 
          name: "Pre-Fuel", 
          timing: "30min before",
          foodType: "fast-acting carbs",
          description: "Quick energy for performance",
          macros: { calories: 250, protein: 8, carbs: 50, fat: 2 },
          examples: [
            "Banana with honey",
            "Energy bar",
            "Sports drink + dates"
          ],
          reasoning: "Fast-digesting carbs provide immediate energy without causing digestive stress during intense training."
        },
        post: { 
          name: "Post-Fuel", 
          timing: "30min after",
          foodType: "carbs + protein",
          description: "Muscle recovery support",
          macros: { calories: 300, protein: 25, carbs: 35, fat: 8 },
          examples: [
            "Protein smoothie with fruit",
            "Cottage cheese with fruit",
            "Turkey sandwich on whole grain"
          ],
          reasoning: "3:1 carb-to-protein ratio optimizes glycogen replenishment and muscle protein synthesis after intense exercise."
        }
      };
    } else if (activity.intensity === "moderate") {
      return {
        pre: { 
          name: "Pre-Fuel", 
          timing: "1hr before",
          foodType: "balanced macros",
          description: "Sustained energy release",
          macros: { calories: 200, protein: 12, carbs: 30, fat: 6 },
          examples: [
            "Oatmeal with berries",
            "Greek yogurt with granola",
            "Apple with almond butter"
          ],
          reasoning: "Balanced macronutrients provide steady energy release for moderate-intensity workouts lasting 45-90 minutes."
        },
        post: { 
          name: "Post-Fuel", 
          timing: "30min after",
          foodType: "carbs + protein",
          description: "Muscle recovery support",
          macros: { calories: 300, protein: 25, carbs: 35, fat: 8 },
          examples: [
            "Protein smoothie with fruit",
            "Cottage cheese with fruit",
            "Turkey sandwich on whole grain"
          ],
          reasoning: "Post-workout nutrition within 30 minutes helps restore energy stores and supports muscle recovery."
        }
      };
    } else {
      return {
        pre: { 
          name: "Pre-Fuel", 
          timing: "before",
          foodType: "micronutrient-dense",
          description: "Light fuel with vitamins",
          macros: { calories: 100, protein: 5, carbs: 15, fat: 3 },
          examples: [
            "Handful of berries",
            "Small green smoothie",
            "Herbal tea with honey"
          ],
          reasoning: "Light activities require minimal fuel - focus on hydration and micronutrients for overall wellness."
        },
        post: { 
          name: "Post-Fuel", 
          timing: "after",
          foodType: "micronutrient-dense",
          description: "Recovery with nutrients",
          macros: { calories: 150, protein: 10, carbs: 20, fat: 5 },
          examples: [
            "Green tea + nuts",
            "Vegetable juice",
            "Small salad with seeds"
          ],
          reasoning: "Anti-inflammatory foods and antioxidants support recovery from light exercise and promote overall health."
        }
      };
    }
  };

  // Calculate macro percentage for progress bars
  const getMacroPercentage = (mealAmount: number, dailyTarget: number) => {
    return Math.min((mealAmount / dailyTarget) * 100, 100);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'intense': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderProgressBar = (current: number, target: number, color: string) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderMacroCard = () => (
    <Card className="bg-[#1a1a1c] border-[#2a2a2c] mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-base">
          <Target className="w-5 h-5" />
          Daily Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-medium">Calories</span>
              <span className="text-gray-400 text-xs">{macroLogged.calories}/{macroTargets.calories}</span>
            </div>
            {renderProgressBar(macroLogged.calories, macroTargets.calories, "bg-orange-500")}
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-medium">Protein</span>
              <span className="text-gray-400 text-xs">{macroLogged.protein}g/{macroTargets.protein}g</span>
            </div>
            {renderProgressBar(macroLogged.protein, macroTargets.protein, "bg-blue-500")}
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-medium">Carbs</span>
              <span className="text-gray-400 text-xs">{macroLogged.carbs}g/{macroTargets.carbs}g</span>
            </div>
            {renderProgressBar(macroLogged.carbs, macroTargets.carbs, "bg-green-500")}
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-medium">Fat</span>
              <span className="text-gray-400 text-xs">{macroLogged.fat}g/{macroTargets.fat}g</span>
            </div>
            {renderProgressBar(macroLogged.fat, macroTargets.fat, "bg-purple-500")}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const toggleMealExpansion = (mealId: string) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(mealId)) {
      newExpanded.delete(mealId);
    } else {
      newExpanded.add(mealId);
    }
    setExpandedMeals(newExpanded);
  };

  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());

  const toggleReasoningExpansion = (reasoningId: string) => {
    const newExpanded = new Set(expandedReasoning);
    if (newExpanded.has(reasoningId)) {
      newExpanded.delete(reasoningId);
    } else {
      newExpanded.add(reasoningId);
    }
    setExpandedReasoning(newExpanded);
  };

  const handleScanFood = (mealType: string) => {
    // Placeholder for AI food scanning functionality
    console.log(`Opening AI scanner for ${mealType}`);
    // TODO: Implement AI food scanning modal
  };

  const handleLogMeal = (meal: any) => {
    // Placeholder for manual meal logging
    console.log(`Logging meal:`, meal);
    // TODO: Implement manual meal logging
  };

  const renderSimpleMeal = (meal: any, type: 'pre' | 'post', activityId: string) => {
    const isPreFuel = type === 'pre';
    const IconComponent = isPreFuel ? Zap : Target;
    const iconColor = isPreFuel ? "text-yellow-400" : "text-green-400";
    const mealId = `${activityId}-${type}`;
    const isExpanded = expandedMeals.has(mealId);
    
    return (
      <div className="bg-[#2a2a2c] rounded-lg border border-[#3a3a3c] overflow-hidden">
        {/* Main Meal Card - Clickable for expansion */}
        <div 
          className="flex items-center justify-between p-4 hover:border-[#4a4a4c] transition-colors cursor-pointer"
          onClick={() => toggleMealExpansion(mealId)}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <IconComponent className={`w-4 h-4 ${iconColor}`} />
              <div>
                <p className="text-white text-sm font-medium">{meal.name}</p>
                <p className="text-gray-400 text-xs">{meal.timing}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{meal.foodType}</p>
              <p className="text-gray-400 text-xs">{meal.description}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-90 text-white' : 'text-gray-400'
              }`} />
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="bg-gradient-to-br from-[#1a1a1c] to-[#2a2a2c] mx-4 mb-4 rounded-xl border border-[#3a3a3c] overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Macro Breakdown with Progress Bars */}
              <div className="bg-[#0a0a0c] rounded-xl p-5">
                <h4 className="text-white font-medium text-base mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Macro Targets
                </h4>
                <div className="space-y-4">
                  {/* Protein */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-gray-300 text-sm font-medium">Protein</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full" 
                          style={{ width: `${getMacroPercentage(meal.macros.protein, macroTargets.protein)}%` }}
                        ></div>
                      </div>
                      <span className="text-blue-400 font-medium text-sm min-w-[40px]">{meal.macros.protein}g</span>
                    </div>
                  </div>
                  
                  {/* Carbs */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-gray-300 text-sm font-medium">Carbs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400 rounded-full" 
                          style={{ width: `${getMacroPercentage(meal.macros.carbs, macroTargets.carbs)}%` }}
                        ></div>
                      </div>
                      <span className="text-green-400 font-medium text-sm min-w-[40px]">{meal.macros.carbs}g</span>
                    </div>
                  </div>
                  
                  {/* Fat */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-gray-300 text-sm font-medium">Fat</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-400 rounded-full" 
                          style={{ width: `${getMacroPercentage(meal.macros.fat, macroTargets.fat)}%` }}
                        ></div>
                      </div>
                      <span className="text-orange-400 font-medium text-sm min-w-[40px]">{meal.macros.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasoning - Collapsible Button */}
              {meal.reasoning && (
                <div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent hover:bg-[#2a2a2c] text-gray-300 border-[#3a3a3c] hover:border-[#4a4a4c] justify-between h-auto py-3"
                    onClick={() => toggleReasoningExpansion(`${mealId}-reasoning`)}
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Why this meal?</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                      expandedReasoning.has(`${mealId}-reasoning`) ? 'rotate-90' : ''
                    }`} />
                  </Button>
                  {expandedReasoning.has(`${mealId}-reasoning`) && (
                    <div className="mt-3 p-4 bg-[#0a0a0c] rounded-xl border border-[#2a2a2c]">
                      <p className="text-gray-300 text-sm">{meal.reasoning}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Example Foods - Compact */}
              <div>
                <h4 className="text-white font-medium text-base mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-primary" />
                  Fuel Ideas
                </h4>
                <div className="space-y-2">
                  {meal.examples.map((example: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 bg-[#0a0a0c] rounded-lg border border-[#2a2a2c]"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-gray-300 text-sm font-medium flex-1">{example}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold h-12 rounded-xl"
                  onClick={() => handleScanFood(meal.name)}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Scan
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 bg-transparent hover:bg-[#2a2a2c] text-white border-[#3a3a3c] hover:border-[#4a4a4c] font-semibold h-12 rounded-xl"
                  onClick={() => handleLogMeal(meal)}
                >
                  Manual Entry
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWorkout = (activity: ActivityScheduleItem, idx: number) => {
    const meals = getWorkoutMeals(activity);
    const activityId = `${activity.activity}-${activity.timeOfDay}-${idx}`;
    
    return (
      <Card key={idx} className="bg-[#1a1a1c] border-[#2a2a2c]">
        <CardContent className="p-4">
          {/* Workout Info */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-medium text-base">{activity.activity}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-medium ${getIntensityColor(activity.intensity)}`}>
                  {activity.intensity}
                </span>
                {activity.durationMinutes && (
                  <span className="text-gray-400 text-xs">
                    • {activity.durationMinutes}min
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Simplified Meals */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-gray-300 text-sm font-medium">Fuel</span>
            </div>
            {renderSimpleMeal(meals.pre, 'pre', activityId)}
            {renderSimpleMeal(meals.post, 'post', activityId)}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTimeBlock = (timeBlock: "morning" | "afternoon" | "evening") => {
    const { currentTimeBlock } = getCurrentTimeInfo();
    const isCurrentBlock = timeBlock === currentTimeBlock;
    const blockActivities = activities.filter(activity => activity.timeOfDay === timeBlock);
    const blockInfo = TIME_BLOCKS[timeBlock];

    const IconComponent = blockInfo.icon;

    return (
      <div 
        key={timeBlock} 
        ref={isCurrentBlock ? currentTimeBlockRef : null}
        className="space-y-4"
      >
        {/* Time Block Header */}
        <div className="flex items-center gap-3">
          <IconComponent className={`w-6 h-6 ${isCurrentBlock ? 'text-primary' : 'text-gray-400'}`} />
          <div>
            <h2 className={`font-medium text-base ${isCurrentBlock ? 'text-white' : 'text-gray-300'}`}>{blockInfo.label}</h2>
            {isCurrentBlock && (
              <Badge variant="default" className="text-xs bg-primary">
                Current
              </Badge>
            )}
          </div>
        </div>

        {/* Workouts or Empty State */}
        {blockActivities.length === 0 ? (
          <Card className="bg-[#1a1a1c] border-[#2a2a2c]">
            <CardContent className="p-6 text-center">
              <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No workouts scheduled</p>
              <p className="text-gray-600 text-xs mt-1">Perfect time to rest or add a session</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {blockActivities.map(renderWorkout)}
          </div>
        )}
      </div>
    );
  };

  const renderCalendarWeek = () => {
    const weekDates = getWeekDates();
    const today = new Date();
    const isToday = (date: Date) => {
      return date.toDateString() === today.toDateString();
    };
    const isSelected = (date: Date) => {
      return date.toDateString() === selectedDate.toDateString();
    };

    return (
      <Card className="bg-[#1a1a1c] border-[#2a2a2c] mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const { dayName, dayNumber } = formatDate(date);
              const isSelectedDate = isSelected(date);
              const isTodayDate = isToday(date);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                    isSelectedDate
                      ? 'bg-primary text-white'
                      : isTodayDate
                      ? 'bg-[#2a2a2c] text-white border-2 border-primary/50'
                      : 'bg-[#2a2a2c] text-gray-400 hover:bg-[#3a3a3c] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-medium">{dayName}</span>
                  <span className={`text-lg font-bold ${
                    isSelectedDate ? 'text-white' : isTodayDate ? 'text-primary' : 'text-gray-300'
                  }`}>
                    {dayNumber}
                  </span>
                  {isTodayDate && !isSelectedDate && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute fallback={<FullPageSpinner />}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const { currentDay } = getCurrentTimeInfo();
  const selectedDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][selectedDate.getDay()];

  return (
    <ProtectedRoute fallback={<FullPageSpinner />}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Today's Fuel Plan</h1>
          <p className="text-gray-400">{selectedDayName}</p>
          
          {/* Encouraging Notice */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-200 text-sm">
              Remember, you don't need to be perfect—fuel however you feel best. This guidance will help point you in the right direction.
            </p>
          </div>
        </div>

        {/* 7-Day Calendar */}
        {renderCalendarWeek()}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Content */}
        {activities.length === 0 ? (
          <Card className="bg-[#1a1a1c] border-[#2a2a2c]">
            <CardContent className="p-8 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Rest Day</h3>
              <p className="text-gray-400 mb-6">
                No workouts scheduled for {selectedDayName}. Perfect time to recover!
              </p>
              <Button 
                onClick={() => window.location.href = '/onboarding'} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Macro Tracking Card */}
            {renderMacroCard()}

            {/* Time Blocks */}
            <div className="space-y-8">
              {(["morning", "afternoon", "evening"] as const).map(renderTimeBlock)}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 