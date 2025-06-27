import { databaseService, UserProfile } from './database';
import { authService } from './auth';

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

export interface TestProfile {
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
}

export class TestUtils {
  static testUsers: TestUser[] = [
    {
      email: "test.user@example.com",
      password: "TestPassword123!",
      name: "Test User"
    },
    {
      email: "onboarding.test@example.com", 
      password: "TestPassword123!",
      name: "Onboarding Test User"
    }
  ];

  static sampleProfile: TestProfile = {
    age: 25,
    sex: "male",
    weightPounds: 180,
    heightInches: 72,
    wakeupTime: "07:00",
    bedTime: "23:00",
    restrictions: ["gluten-free", "dairy-free"],
    preferences: ["high-protein", "organic"],
    goals: ["build-muscle", "improve-performance"],
    activities: ["strength_training", "high_intensity"]
  };

  // Test database connection
  static async testDatabaseConnection() {
    try {
      const result = await databaseService.testConnection();
      return {
        success: result.success,
        message: result.message,
        collections: result.collections
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Database test failed: ${error.message}`
      };
    }
  }

  // Test user profile creation with authenticated user
  static async testProfileCreation(userId: string, profileData: TestProfile) {
    try {
      const profile = await databaseService.createUserProfile({
        userId,
        ...profileData
      });
      
      return {
        success: true,
        profile,
        message: "Profile created successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Profile creation failed"
      };
    }
  }

  // Test user profile retrieval with authenticated user
  static async testProfileRetrieval(userId: string) {
    try {
      const profile = await databaseService.getUserProfile(userId);
      return {
        success: true,
        profile,
        message: profile ? "Profile retrieved successfully" : "No profile found"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Profile retrieval failed"
      };
    }
  }

  // Test user profile update with authenticated user
  static async testProfileUpdate(profileId: string, updates: Partial<TestProfile>) {
    try {
      const updatedProfile = await databaseService.updateUserProfile(profileId, updates);
      return {
        success: true,
        profile: updatedProfile,
        message: "Profile updated successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Profile update failed"
      };
    }
  }

  // Test complete user flow with authenticated user
  static async testCompleteUserFlow(userId: string) {
    const results = {
      databaseConnection: null as any,
      profileCreation: null as any,
      profileRetrieval: null as any,
      profileUpdate: null as any
    };

    // Test 1: Database Connection
    results.databaseConnection = await this.testDatabaseConnection();
    
    if (!results.databaseConnection.success) {
      return results;
    }

    // Test 2: Profile Creation (using authenticated user ID)
    results.profileCreation = await this.testProfileCreation(userId, this.sampleProfile);
    
    if (!results.profileCreation.success) {
      return results;
    }

    // Test 3: Profile Retrieval
    results.profileRetrieval = await this.testProfileRetrieval(userId);
    
    if (!results.profileRetrieval.success) {
      return results;
    }

    // Test 4: Profile Update
    const updateData = {
      age: 26,
      weightPounds: 185,
      goals: ["build-muscle", "lose-weight"]
    };
    
    results.profileUpdate = await this.testProfileUpdate(
      results.profileCreation.profile.$id!,
      updateData
    );

    return results;
  }

  // Test with current authenticated user
  static async testWithCurrentUser() {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: "No authenticated user found. Please log in first."
        };
      }

      return await this.testCompleteUserFlow(currentUser.$id);
    } catch (error: any) {
      return {
        success: false,
        message: `Test failed: ${error.message}`
      };
    }
  }

  // Validate profile data structure
  static validateProfileStructure(profile: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredFields = ['userId', 'age', 'sex', 'weightPounds', 'heightInches'];
    const arrayFields = ['restrictions', 'preferences', 'goals', 'activities'];

    // Check required fields
    requiredFields.forEach(field => {
      if (!(field in profile)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check array fields
    arrayFields.forEach(field => {
      if (!(field in profile) || !Array.isArray(profile[field])) {
        errors.push(`Missing or invalid array field: ${field}`);
      }
    });

    // Check data types
    if (typeof profile.age !== 'number') {
      errors.push('Age must be a number');
    }
    if (!['male', 'female', 'other'].includes(profile.sex)) {
      errors.push('Sex must be male, female, or other');
    }
    if (typeof profile.weightPounds !== 'number') {
      errors.push('Weight must be a number');
    }
    if (typeof profile.heightInches !== 'number') {
      errors.push('Height must be a number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 