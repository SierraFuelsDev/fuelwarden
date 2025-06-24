import { Databases, ID, Query } from "appwrite";
import { client } from "./appwrite";

const databases = new Databases(client);
const DATABASE_ID = "fuelwarden_db"; // You'll need to create this in Appwrite
const USER_PROFILES_COLLECTION_ID = "user_profiles";

export interface UserProfile {
  $id?: string;
  userId: string;
  age: number;
  sex: "male" | "female" | "other";
  weightPounds: number;
  heightInches: number;
  wakeupTime?: string;
  bedTime?: string;
  restrictions: string[];
  preferences: string[];
  goals: string[];
  activities: string[];
  supplements: string[];
  $createdAt?: string;
  $updatedAt?: string;
}

class DatabaseService {
  // Create a new user profile
  async createUserProfile(profile: Omit<UserProfile, "$id" | "$createdAt" | "$updatedAt">): Promise<UserProfile> {
    try {
      const result = await databases.createDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        ID.unique(),
        {
          userId: profile.userId,
          age: profile.age,
          sex: profile.sex,
          weightPounds: profile.weightPounds,
          heightInches: profile.heightInches,
          wakeupTime: profile.wakeupTime,
          bedTime: profile.bedTime,
          restrictions: profile.restrictions,
          preferences: profile.preferences,
          goals: profile.goals,
          activities: profile.activities,
          supplements: profile.supplements,
        }
      );
      
      return result as UserProfile;
    } catch (error: any) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  // Get user profile by userId
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
      
      return result.documents[0] as UserProfile;
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateUserProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const result = await databases.updateDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        profileId,
        updates
      );
      
      return result as UserProfile;
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
}

export const databaseService = new DatabaseService(); 