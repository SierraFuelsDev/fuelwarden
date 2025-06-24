import { Account, ID, Models } from "appwrite";
import { client } from "./appwrite";

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthUser extends Models.User<Models.Preferences> {}

class AuthService {
  private account: Account;

  constructor() {
    this.account = new Account(client);
  }

  // Sign up with email and password
  async signUp(email: string, password: string, name?: string): Promise<AuthUser> {
    try {
      const user = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      // Auto-login after signup
      await this.signIn(email, password);
      
      return user;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<Models.Session> {
    try {
      // Clear any existing session first
      try {
        await this.account.deleteSession('current');
      } catch (e) {
        // Session might not exist, which is fine
      }

      const session = await this.account.createEmailPasswordSession(email, password);
      
      // Store session info for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('appwrite-session', JSON.stringify(session));
      }
      
      return session;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await this.account.deleteSession('current');
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('appwrite-session');
      }
    } catch (error: any) {
      // Even if there's an error, clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('appwrite-session');
      }
      throw this.handleError(error);
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await this.account.get();
      return user;
    } catch (error: any) {
      // User not authenticated
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.account.get();
      return true;
    } catch {
      return false;
    }
  }

  // Create OAuth session
  async createOAuthSession(provider: 'google' | 'github' | 'discord', successUrl: string, failureUrl: string): Promise<void> {
    try {
      await this.account.createOAuth2Session(
        provider as any,
        successUrl,
        failureUrl
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Password reset
  async createPasswordRecovery(email: string, url: string): Promise<void> {
    try {
      await this.account.createRecovery(email, url);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Update password
  async updatePassword(password: string, oldPassword?: string): Promise<AuthUser> {
    try {
      if (oldPassword) {
        return await this.account.updatePassword(password, oldPassword);
      } else {
        return await this.account.updatePassword(password);
      }
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Update user profile
  async updateProfile(name: string, email?: string): Promise<AuthUser> {
    try {
      if (email) {
        return await this.account.updateName(name);
      } else {
        return await this.account.updateName(name);
      }
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Handle and format errors
  private handleError(error: any): AuthError {
    console.error('Auth error:', error);
    
    if (error?.message) {
      return {
        message: error.message,
        code: error?.code || 'UNKNOWN_ERROR'
      };
    }
    
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }
}

export const authService = new AuthService(); 