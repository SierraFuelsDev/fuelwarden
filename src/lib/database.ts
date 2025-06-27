import { Databases, ID, Query } from "appwrite";
import { client } from "./appwrite";

const databases = new Databases(client);
const DATABASE_ID = "fuelwarden"; // Updated to match your actual database name
const MEAL_LOGS_COLLECTION_ID = "meal_logs";
const MEAL_PLANS_COLLECTION_ID = "meal_plans";
const ACTIVITY_SCHEDULE_COLLECTION_ID = "activity_schedule";
const USER_PROFILES_COLLECTION_ID = "user_profiles";

export interface MealLog {
  $id?: string;
  userId: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foods: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: number;
    unit: string;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface MealPlan {
  $id?: string;
  userId: string;
  date: string;
  meals: Array<{
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    foods: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      quantity: number;
      unit: string;
    }>;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface ActivitySchedule {
  $id?: string;
  userId: string;
  date: string;
  activities: Array<{
    name: string;
    duration: number; // in minutes
    caloriesBurned: number;
    type: "cardio" | "strength" | "flexibility" | "other";
    notes?: string;
  }>;
  totalDuration: number;
  totalCaloriesBurned: number;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface UserProfile {
  $id?: string;
  userId: string;
  age: number;
  weightPounds: number;
  heightInches: number;
  sex: "male" | "female" | "other";
  wakeupTime?: string;
  bedTime?: string;
  restrictions: string[];
  preferences: string[];
  goals: string[];
  activities: string[];
  supplements?: string[];
  $createdAt?: string;
  $updatedAt?: string;
}

class DatabaseService {
  // ===== MEAL LOG METHODS =====
  
  async createMealLog(mealLog: Omit<MealLog, "$id" | "$createdAt" | "$updatedAt">): Promise<MealLog> {
    try {
      const result = await databases.createDocument(
        DATABASE_ID,
        MEAL_LOGS_COLLECTION_ID,
        ID.unique(),
        mealLog
      );
      return result as unknown as MealLog;
    } catch (error: any) {
      throw new Error(`Failed to create meal log: ${error.message}`);
    }
  }

  async getUserMealLogs(userId: string, date?: string): Promise<MealLog[]> {
    try {
      const queries = [Query.equal("userId", userId)];
      if (date) {
        queries.push(Query.equal("date", date));
      }
      
      const result = await databases.listDocuments(
        DATABASE_ID,
        MEAL_LOGS_COLLECTION_ID,
        queries
      );
      
      return result.documents as unknown as MealLog[];
    } catch (error: any) {
      throw new Error(`Failed to get meal logs: ${error.message}`);
    }
  }

  // ===== MEAL PLAN METHODS =====
  
  async createMealPlan(mealPlan: Omit<MealPlan, "$id" | "$createdAt" | "$updatedAt">): Promise<MealPlan> {
    try {
      const result = await databases.createDocument(
        DATABASE_ID,
        MEAL_PLANS_COLLECTION_ID,
        ID.unique(),
        mealPlan
      );
      return result as unknown as MealPlan;
    } catch (error: any) {
      throw new Error(`Failed to create meal plan: ${error.message}`);
    }
  }

  async getUserMealPlans(userId: string, date?: string): Promise<MealPlan[]> {
    try {
      const queries = [Query.equal("userId", userId)];
      if (date) {
        queries.push(Query.equal("date", date));
      }
      
      const result = await databases.listDocuments(
        DATABASE_ID,
        MEAL_PLANS_COLLECTION_ID,
        queries
      );
      
      return result.documents as unknown as MealPlan[];
    } catch (error: any) {
      throw new Error(`Failed to get meal plans: ${error.message}`);
    }
  }

  // ===== ACTIVITY SCHEDULE METHODS =====
  
  async createActivitySchedule(activitySchedule: Omit<ActivitySchedule, "$id" | "$createdAt" | "$updatedAt">): Promise<ActivitySchedule> {
    try {
      const result = await databases.createDocument(
        DATABASE_ID,
        ACTIVITY_SCHEDULE_COLLECTION_ID,
        ID.unique(),
        activitySchedule
      );
      return result as unknown as ActivitySchedule;
    } catch (error: any) {
      throw new Error(`Failed to create activity schedule: ${error.message}`);
    }
  }

  async getUserActivitySchedules(userId: string, date?: string): Promise<ActivitySchedule[]> {
    try {
      const queries = [Query.equal("userId", userId)];
      if (date) {
        queries.push(Query.equal("date", date));
      }
      
      const result = await databases.listDocuments(
        DATABASE_ID,
        ACTIVITY_SCHEDULE_COLLECTION_ID,
        queries
      );
      
      return result.documents as unknown as ActivitySchedule[];
    } catch (error: any) {
      throw new Error(`Failed to get activity schedules: ${error.message}`);
    }
  }

  // ===== USER PROFILE METHODS =====
  
  async createUserProfile(userProfile: Omit<UserProfile, "$id" | "$createdAt" | "$updatedAt">): Promise<UserProfile> {
    try {
      const result = await databases.createDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        ID.unique(),
        userProfile
      );
      return result as unknown as UserProfile;
    } catch (error: any) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      
      if (result.documents.length === 0) {
        return null;
      }
      
      return result.documents[0] as unknown as UserProfile;
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  async updateUserProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        profileId,
        updates
      );
      return result as unknown as UserProfile;
    } catch (error: any) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }
}

export const databaseService = new DatabaseService(); 