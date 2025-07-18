import { Databases, ID, Query, Permission, Role } from "appwrite";
import { client } from "./appwrite";

const databases = new Databases(client);
const DATABASE_ID = "fuelwarden";
const USER_PROFILES_COLLECTION_ID = "user_profiles";
const ACTIVITY_SCHEDULE_COLLECTION_ID = "activity_schedule";

// Form interface (what the frontend uses)
export interface UserProfileForm {
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

// Database interface (what Appwrite expects)
export interface UserProfile {
  $id?: string;
  userId: string;
  age: number;
  weightPounds: number;
  heightInches: number;
  sex: "Male" | "Female" | "Non-Binary" | "Other";
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

// Activity Schedule interfaces
export interface ActivityScheduleItem {
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  timeOfDay: "morning" | "afternoon" | "evening";
  activity: string;
  intensity: "light" | "moderate" | "intense";
  durationMinutes?: number;
  notes?: string;
}

export interface ActivityScheduleForm {
  $id?: string;
  userId: string;
  schedule: ActivityScheduleItem[];
  $createdAt?: string;
  $updatedAt?: string;
}

// Helper function to transform sex values
const transformSexForDatabase = (sex: "male" | "female" | "other"): "Male" | "Female" | "Non-Binary" | "Other" => {
  switch (sex) {
    case "male":
      return "Male";
    case "female":
      return "Female";
    case "other":
      return "Other";
    default:
      return "Other";
  }
};

// Helper function to transform sex values from database
const transformSexFromDatabase = (sex: "Male" | "Female" | "Non-Binary" | "Other"): "male" | "female" | "other" => {
  switch (sex) {
    case "Male":
      return "male";
    case "Female":
      return "female";
    case "Non-Binary":
    case "Other":
      return "other";
    default:
      return "other";
  }
};

class DatabaseService {
  // Create user profile with document-level permissions
  async createUserProfile(userProfile: Omit<UserProfileForm, "$id" | "$createdAt" | "$updatedAt">): Promise<UserProfileForm> {
    try {
      // Transform the data for database storage
      const dbProfile = {
        ...userProfile,
        sex: transformSexForDatabase(userProfile.sex)
      };

      const result = await databases.createDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        ID.unique(),
        dbProfile,
        [
          Permission.read(Role.user(userProfile.userId)),
          Permission.update(Role.user(userProfile.userId)),
          Permission.delete(Role.user(userProfile.userId))
        ]
      );
      
      // Transform back to form format
      const formProfile = {
        ...result,
        sex: transformSexFromDatabase(result.sex as "Male" | "Female" | "Non-Binary" | "Other")
      } as unknown as UserProfileForm;
      
      return formProfile;
    } catch (error: any) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  // Get user profile by userId
  async getUserProfile(userId: string): Promise<UserProfileForm | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      
      if (result.documents.length === 0) {
        return null;
      }
      
      // Transform back to form format
      const formProfile = {
        ...result.documents[0],
        sex: transformSexFromDatabase(result.documents[0].sex as "Male" | "Female" | "Non-Binary" | "Other")
      } as unknown as UserProfileForm;
      
      return formProfile;
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateUserProfile(profileId: string, updates: Partial<UserProfileForm>): Promise<UserProfileForm> {
    try {
      // Transform the updates for database storage
      const dbUpdates = {
        ...updates,
        ...(updates.sex && { sex: transformSexForDatabase(updates.sex) })
      };

      const result = await databases.updateDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        profileId,
        dbUpdates
      );
      
      // Transform back to form format
      const formProfile = {
        ...result,
        sex: transformSexFromDatabase(result.sex as "Male" | "Female" | "Non-Binary" | "Other")
      } as unknown as UserProfileForm;
      
      return formProfile;
    } catch (error: any) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  // Delete user profile
  async deleteUserProfile(profileId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        profileId
      );
    } catch (error: any) {
      throw new Error(`Failed to delete user profile: ${error.message}`);
    }
  }

  // Create or update user profile
  async upsertUserProfile(userProfile: Omit<UserProfileForm, "$id" | "$createdAt" | "$updatedAt">): Promise<UserProfileForm> {
    try {
      const existingProfile = await this.getUserProfile(userProfile.userId);
      
      if (existingProfile) {
        return await this.updateUserProfile(existingProfile.$id!, userProfile);
      } else {
        return await this.createUserProfile(userProfile);
      }
    } catch (error: any) {
      throw new Error(`Failed to upsert user profile: ${error.message}`);
    }
  }

  // Create activity schedule with document-level permissions
  async createActivitySchedule(activitySchedule: Omit<ActivityScheduleForm, "$id" | "$createdAt" | "$updatedAt">): Promise<ActivityScheduleForm> {
    try {
      const result = await databases.createDocument(
        DATABASE_ID,
        ACTIVITY_SCHEDULE_COLLECTION_ID,
        ID.unique(),
        activitySchedule,
        [
          Permission.read(Role.user(activitySchedule.userId)),
          Permission.update(Role.user(activitySchedule.userId)),
          Permission.delete(Role.user(activitySchedule.userId))
        ]
      );
      
      return result as unknown as ActivityScheduleForm;
    } catch (error: any) {
      throw new Error(`Failed to create activity schedule: ${error.message}`);
    }
  }

  // Get activity schedule by userId
  async getActivitySchedule(userId: string): Promise<ActivityScheduleForm | null> {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        ACTIVITY_SCHEDULE_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      
      if (result.documents.length === 0) {
        return null;
      }
      
      return result.documents[0] as unknown as ActivityScheduleForm;
    } catch (error: any) {
      throw new Error(`Failed to get activity schedule: ${error.message}`);
    }
  }

  // Update activity schedule
  async updateActivitySchedule(scheduleId: string, updates: Partial<ActivityScheduleForm>): Promise<ActivityScheduleForm> {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        ACTIVITY_SCHEDULE_COLLECTION_ID,
        scheduleId,
        updates
      );
      
      return result as unknown as ActivityScheduleForm;
    } catch (error: any) {
      throw new Error(`Failed to update activity schedule: ${error.message}`);
    }
  }

  // Create or update activity schedule
  async upsertActivitySchedule(activitySchedule: Omit<ActivityScheduleForm, "$id" | "$createdAt" | "$updatedAt">): Promise<ActivityScheduleForm> {
    try {
      const existingSchedule = await this.getActivitySchedule(activitySchedule.userId);
      
      if (existingSchedule) {
        return await this.updateActivitySchedule(existingSchedule.$id!, activitySchedule);
      } else {
        return await this.createActivitySchedule(activitySchedule);
      }
    } catch (error: any) {
      throw new Error(`Failed to upsert activity schedule: ${error.message}`);
    }
  }
}

export const databaseService = new DatabaseService(); 