import { Databases, ID, Query } from "appwrite";
import { client } from "./appwrite";
import { Account } from "appwrite";

const databases = new Databases(client);
const DATABASE_ID = "fuelwarden"; // Updated to match user's actual database name
const MEAL_LOGS_COLLECTION_ID = "meal_logs";
const MEAL_PLANS_COLLECTION_ID = "meal_plans";
const ACTIVITY_SCHEDULE_COLLECTION_ID = "activity_schedule";
const USER_PROFILES_COLLECTION_ID = "user_profiles";

// Enhanced logging utility
const logDatabaseOperation = (operation: string, collection: string, userId?: string, error?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    collection,
    userId,
    success: !error,
    error: error?.message || null
  };
  
  if (error) {
    console.error('Database Operation Failed:', logEntry);
  } else {
    console.log('Database Operation Success:', logEntry);
  }
};

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

// Validation utilities
const validateUserProfile = (profile: Partial<UserProfile>): void => {
  if (profile.age && (profile.age < 13 || profile.age > 120)) {
    throw new Error("Age must be between 13 and 120");
  }
  if (profile.weightPounds && (profile.weightPounds < 50 || profile.weightPounds > 500)) {
    throw new Error("Weight must be between 50 and 500 pounds");
  }
  if (profile.heightInches && (profile.heightInches < 48 || profile.heightInches > 96)) {
    throw new Error("Height must be between 48 and 96 inches");
  }
  if (profile.sex && !["male", "female", "other"].includes(profile.sex)) {
    throw new Error("Sex must be male, female, or other");
  }
};

const validateUserId = (userId: string): void => {
  if (!userId || typeof userId !== 'string') {
    throw new Error("Valid userId is required");
  }
};

class DatabaseService {
  // ===== MEAL LOG METHODS =====
  
  async createMealLog(mealLog: Omit<MealLog, "$id" | "$createdAt" | "$updatedAt">): Promise<MealLog> {
    try {
      validateUserId(mealLog.userId);
      
      const result = await databases.createDocument(
        DATABASE_ID,
        MEAL_LOGS_COLLECTION_ID,
        ID.unique(),
        mealLog
      );
      
      logDatabaseOperation('create', MEAL_LOGS_COLLECTION_ID, mealLog.userId);
      return result as unknown as MealLog;
    } catch (error: any) {
      logDatabaseOperation('create', MEAL_LOGS_COLLECTION_ID, mealLog.userId, error);
      throw new Error(`Failed to create meal log: ${error.message}`);
    }
  }

  async getUserMealLogs(userId: string, date?: string): Promise<MealLog[]> {
    try {
      validateUserId(userId);
      
      const queries = [Query.equal("userId", userId)];
      if (date) {
        queries.push(Query.equal("date", date));
      }
      
      const result = await databases.listDocuments(
        DATABASE_ID,
        MEAL_LOGS_COLLECTION_ID,
        queries
      );
      
      logDatabaseOperation('read', MEAL_LOGS_COLLECTION_ID, userId);
      return result.documents as unknown as MealLog[];
    } catch (error: any) {
      logDatabaseOperation('read', MEAL_LOGS_COLLECTION_ID, userId, error);
      throw new Error(`Failed to get meal logs: ${error.message}`);
    }
  }

  async updateMealLog(mealLogId: string, updates: Partial<MealLog>): Promise<MealLog> {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        MEAL_LOGS_COLLECTION_ID,
        mealLogId,
        updates
      );
      
      logDatabaseOperation('update', MEAL_LOGS_COLLECTION_ID, updates.userId);
      return result as unknown as MealLog;
    } catch (error: any) {
      logDatabaseOperation('update', MEAL_LOGS_COLLECTION_ID, updates.userId, error);
      throw new Error(`Failed to update meal log: ${error.message}`);
    }
  }

  async deleteMealLog(mealLogId: string, userId: string): Promise<void> {
    try {
      validateUserId(userId);
      
      await databases.deleteDocument(
        DATABASE_ID,
        MEAL_LOGS_COLLECTION_ID,
        mealLogId
      );
      
      logDatabaseOperation('delete', MEAL_LOGS_COLLECTION_ID, userId);
    } catch (error: any) {
      logDatabaseOperation('delete', MEAL_LOGS_COLLECTION_ID, userId, error);
      throw new Error(`Failed to delete meal log: ${error.message}`);
    }
  }

  // ===== MEAL PLAN METHODS =====
  
  async createMealPlan(mealPlan: Omit<MealPlan, "$id" | "$createdAt" | "$updatedAt">): Promise<MealPlan> {
    try {
      validateUserId(mealPlan.userId);
      
      const result = await databases.createDocument(
        DATABASE_ID,
        MEAL_PLANS_COLLECTION_ID,
        ID.unique(),
        mealPlan
      );
      
      logDatabaseOperation('create', MEAL_PLANS_COLLECTION_ID, mealPlan.userId);
      return result as unknown as MealPlan;
    } catch (error: any) {
      logDatabaseOperation('create', MEAL_PLANS_COLLECTION_ID, mealPlan.userId, error);
      throw new Error(`Failed to create meal plan: ${error.message}`);
    }
  }

  async getUserMealPlans(userId: string, date?: string): Promise<MealPlan[]> {
    try {
      validateUserId(userId);
      
      const queries = [Query.equal("userId", userId)];
      if (date) {
        queries.push(Query.equal("date", date));
      }
      
      const result = await databases.listDocuments(
        DATABASE_ID,
        MEAL_PLANS_COLLECTION_ID,
        queries
      );
      
      logDatabaseOperation('read', MEAL_PLANS_COLLECTION_ID, userId);
      return result.documents as unknown as MealPlan[];
    } catch (error: any) {
      logDatabaseOperation('read', MEAL_PLANS_COLLECTION_ID, userId, error);
      throw new Error(`Failed to get meal plans: ${error.message}`);
    }
  }

  async updateMealPlan(mealPlanId: string, updates: Partial<MealPlan>): Promise<MealPlan> {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        MEAL_PLANS_COLLECTION_ID,
        mealPlanId,
        updates
      );
      
      logDatabaseOperation('update', MEAL_PLANS_COLLECTION_ID, updates.userId);
      return result as unknown as MealPlan;
    } catch (error: any) {
      logDatabaseOperation('update', MEAL_PLANS_COLLECTION_ID, updates.userId, error);
      throw new Error(`Failed to update meal plan: ${error.message}`);
    }
  }

  async deleteMealPlan(mealPlanId: string, userId: string): Promise<void> {
    try {
      validateUserId(userId);
      
      await databases.deleteDocument(
        DATABASE_ID,
        MEAL_PLANS_COLLECTION_ID,
        mealPlanId
      );
      
      logDatabaseOperation('delete', MEAL_PLANS_COLLECTION_ID, userId);
    } catch (error: any) {
      logDatabaseOperation('delete', MEAL_PLANS_COLLECTION_ID, userId, error);
      throw new Error(`Failed to delete meal plan: ${error.message}`);
    }
  }

  // ===== ACTIVITY SCHEDULE METHODS =====
  
  async createActivitySchedule(activitySchedule: Omit<ActivitySchedule, "$id" | "$createdAt" | "$updatedAt">): Promise<ActivitySchedule> {
    try {
      validateUserId(activitySchedule.userId);
      
      const result = await databases.createDocument(
        DATABASE_ID,
        ACTIVITY_SCHEDULE_COLLECTION_ID,
        ID.unique(),
        activitySchedule
      );
      
      logDatabaseOperation('create', ACTIVITY_SCHEDULE_COLLECTION_ID, activitySchedule.userId);
      return result as unknown as ActivitySchedule;
    } catch (error: any) {
      logDatabaseOperation('create', ACTIVITY_SCHEDULE_COLLECTION_ID, activitySchedule.userId, error);
      throw new Error(`Failed to create activity schedule: ${error.message}`);
    }
  }

  async getUserActivitySchedules(userId: string, date?: string): Promise<ActivitySchedule[]> {
    try {
      validateUserId(userId);
      
      const queries = [Query.equal("userId", userId)];
      if (date) {
        queries.push(Query.equal("date", date));
      }
      
      const result = await databases.listDocuments(
        DATABASE_ID,
        ACTIVITY_SCHEDULE_COLLECTION_ID,
        queries
      );
      
      logDatabaseOperation('read', ACTIVITY_SCHEDULE_COLLECTION_ID, userId);
      return result.documents as unknown as ActivitySchedule[];
    } catch (error: any) {
      logDatabaseOperation('read', ACTIVITY_SCHEDULE_COLLECTION_ID, userId, error);
      throw new Error(`Failed to get activity schedules: ${error.message}`);
    }
  }

  async updateActivitySchedule(activityScheduleId: string, updates: Partial<ActivitySchedule>): Promise<ActivitySchedule> {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        ACTIVITY_SCHEDULE_COLLECTION_ID,
        activityScheduleId,
        updates
      );
      
      logDatabaseOperation('update', ACTIVITY_SCHEDULE_COLLECTION_ID, updates.userId);
      return result as unknown as ActivitySchedule;
    } catch (error: any) {
      logDatabaseOperation('update', ACTIVITY_SCHEDULE_COLLECTION_ID, updates.userId, error);
      throw new Error(`Failed to update activity schedule: ${error.message}`);
    }
  }

  async deleteActivitySchedule(activityScheduleId: string, userId: string): Promise<void> {
    try {
      validateUserId(userId);
      
      await databases.deleteDocument(
        DATABASE_ID,
        ACTIVITY_SCHEDULE_COLLECTION_ID,
        activityScheduleId
      );
      
      logDatabaseOperation('delete', ACTIVITY_SCHEDULE_COLLECTION_ID, userId);
    } catch (error: any) {
      logDatabaseOperation('delete', ACTIVITY_SCHEDULE_COLLECTION_ID, userId, error);
      throw new Error(`Failed to delete activity schedule: ${error.message}`);
    }
  }

  // ===== USER PROFILE METHODS =====
  
  async createUserProfile(userProfile: Omit<UserProfile, "$id" | "$createdAt" | "$updatedAt">): Promise<UserProfile> {
    try {
      validateUserId(userProfile.userId);
      validateUserProfile(userProfile);
      
      // Check if profile already exists
      const existingProfile = await this.getUserProfile(userProfile.userId);
      if (existingProfile) {
        throw new Error("User profile already exists. Use updateUserProfile instead.");
      }
      
      const result = await databases.createDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        ID.unique(),
        userProfile
      );
      
      logDatabaseOperation('create', USER_PROFILES_COLLECTION_ID, userProfile.userId);
      return result as unknown as UserProfile;
    } catch (error: any) {
      logDatabaseOperation('create', USER_PROFILES_COLLECTION_ID, userProfile.userId, error);
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      validateUserId(userId);
      
      const result = await databases.listDocuments(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      
      logDatabaseOperation('read', USER_PROFILES_COLLECTION_ID, userId);
      
      if (result.documents.length === 0) {
        return null;
      }
      
      return result.documents[0] as unknown as UserProfile;
    } catch (error: any) {
      logDatabaseOperation('read', USER_PROFILES_COLLECTION_ID, userId, error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  async updateUserProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      validateUserProfile(updates);
      
      const result = await databases.updateDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        profileId,
        updates
      );
      
      logDatabaseOperation('update', USER_PROFILES_COLLECTION_ID, updates.userId);
      return result as unknown as UserProfile;
    } catch (error: any) {
      logDatabaseOperation('update', USER_PROFILES_COLLECTION_ID, updates.userId, error);
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  async deleteUserProfile(profileId: string, userId: string): Promise<void> {
    try {
      validateUserId(userId);
      
      await databases.deleteDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        profileId
      );
      
      logDatabaseOperation('delete', USER_PROFILES_COLLECTION_ID, userId);
    } catch (error: any) {
      logDatabaseOperation('delete', USER_PROFILES_COLLECTION_ID, userId, error);
      throw new Error(`Failed to delete user profile: ${error.message}`);
    }
  }

  // Enhanced method to create or update user profile
  async upsertUserProfile(userProfile: Omit<UserProfile, "$id" | "$createdAt" | "$updatedAt">): Promise<UserProfile> {
    try {
      validateUserId(userProfile.userId);
      validateUserProfile(userProfile);
      
      const existingProfile = await this.getUserProfile(userProfile.userId);
      
      if (existingProfile) {
        // Update existing profile
        return await this.updateUserProfile(existingProfile.$id!, userProfile);
      } else {
        // Create new profile
        return await this.createUserProfile(userProfile);
      }
    } catch (error: any) {
      throw new Error(`Failed to upsert user profile: ${error.message}`);
    }
  }

  // Method to get user profile with fallback to default values
  async getUserProfileWithDefaults(userId: string): Promise<UserProfile> {
    try {
      const profile = await this.getUserProfile(userId);
      
      if (profile) {
        return profile;
      }
      
      // Return default profile structure
      return {
        userId,
        age: 0,
        weightPounds: 0,
        heightInches: 0,
        sex: "male" as const,
        restrictions: [],
        preferences: [],
        goals: [],
        activities: [],
        supplements: []
      };
    } catch (error: any) {
      throw new Error(`Failed to get user profile with defaults: ${error.message}`);
    }
  }

  // Test method to verify database connection and collections
  async testConnection(): Promise<{ success: boolean; message: string; collections?: string[] }> {
    try {
      // Try to get current user to verify authentication
      const account = new Account(client);
      const currentUser = await account.get();
      
      if (!currentUser) {
        return {
          success: false,
          message: "No authenticated user found. Please log in first."
        };
      }

      // Try to list documents from user_profiles collection (this will work if collection exists and user has permissions)
      const result = await databases.listDocuments(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        []
      );
      
      return {
        success: true,
        message: `Database connection successful. User: ${currentUser.email}. User profiles collection exists with ${result.documents.length} documents.`,
        collections: [USER_PROFILES_COLLECTION_ID, MEAL_LOGS_COLLECTION_ID, MEAL_PLANS_COLLECTION_ID, ACTIVITY_SCHEDULE_COLLECTION_ID]
      };
    } catch (error: any) {
      if (error.message.includes("Collection") && error.message.includes("not found")) {
        return {
          success: false,
          message: `Collection '${USER_PROFILES_COLLECTION_ID}' not found. Please create it in your Appwrite database.`
        };
      }
      if (error.message.includes("not authorized")) {
        return {
          success: false,
          message: `Permission denied. Please check that your user has the correct permissions for the '${USER_PROFILES_COLLECTION_ID}' collection.`
        };
      }
      return {
        success: false,
        message: `Database connection failed: ${error.message}`
      };
    }
  }

  // Method to get user statistics
  async getUserStats(userId: string): Promise<{
    totalMealLogs: number;
    totalMealPlans: number;
    totalActivities: number;
    profileComplete: boolean;
  }> {
    try {
      validateUserId(userId);
      
      const [mealLogs, mealPlans, activities, profile] = await Promise.all([
        this.getUserMealLogs(userId),
        this.getUserMealPlans(userId),
        this.getUserActivitySchedules(userId),
        this.getUserProfile(userId)
      ]);
      
      return {
        totalMealLogs: mealLogs.length,
        totalMealPlans: mealPlans.length,
        totalActivities: activities.length,
        profileComplete: !!profile
      };
    } catch (error: any) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }
}

export const databaseService = new DatabaseService(); 