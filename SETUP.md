# FuelWarden Setup Guide

## Appwrite Database Configuration

To get the onboarding and profile system working, you need to set up the following in your Appwrite console:

### 1. Create Database
1. Go to your Appwrite Console
2. Navigate to **Databases**
3. Create a new database with ID: `fuelwarden_db`

### 2. Create User Profiles Collection
1. In the `fuelwarden_db` database, create a new collection with ID: `user_profiles`
2. Set the following attributes:

#### Required Attributes:
- **userId** (String, Required)
- **age** (Integer, Required, Min: 13, Max: 120)
- **sex** (Enum, Required, Values: male, female, other)
- **weightPounds** (Integer, Required, Min: 50, Max: 500)
- **heightInches** (Integer, Required, Min: 48, Max: 96)

#### Optional Attributes:
- **wakeupTime** (String, Optional)
- **bedTime** (String, Optional)

#### Array Attributes:
- **restrictions** (String[], Optional)
- **preferences** (String[], Optional)
- **goals** (String[], Optional)
- **activities** (String[], Optional)
- **supplements** (String[], Optional)

### 3. Set Collection Permissions
1. Go to the **Settings** tab of the `user_profiles` collection
2. Set the following permissions:
   - **Create**: Any authenticated user
   - **Read**: Any authenticated user (own documents only)
   - **Update**: Any authenticated user (own documents only)
   - **Delete**: Any authenticated user (own documents only)

### 4. Create Indexes (Optional but Recommended)
Create indexes for better query performance:
- **userId** (Attribute: userId, Type: Key)

### 5. Update Environment Variables
Make sure your environment variables are set correctly in your `.env.local` file:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
```

## Features Implemented

### Onboarding Flow
- **Multi-step form** with 3 steps:
  1. Basic Information (age, sex, weight, height)
  2. Daily Schedule (wake-up time, bed time)
  3. Preferences & Goals (dietary restrictions, food preferences, goals, activities, supplements)
- **Form validation** using Zod schema validation
- **Progress indicator** showing current step
- **Automatic redirect** to dashboard after completion

### Profile Management
- **Comprehensive profile form** for editing all user information
- **Real-time validation** and error handling
- **Success/error messages** for user feedback
- **Account actions** including sign out functionality

### Dashboard Integration
- **User profile display** showing key information
- **Functional quick action buttons** for navigation
- **Profile-aware content** that adapts based on user data

### Authentication Flow
- **Automatic onboarding redirect** for new users
- **Profile completion checking** on login
- **Seamless navigation** between auth, onboarding, and dashboard

## Usage

1. **New User Sign Up**: User signs up → redirected to onboarding → completes profile → redirected to dashboard
2. **Existing User Login**: User logs in → checked for profile → redirected to dashboard (or onboarding if no profile)
3. **Profile Management**: Users can edit their profile from the profile page
4. **Dashboard**: Shows user information and provides quick access to key features

## Technical Details

- **Form Handling**: React Hook Form with Zod validation
- **Database**: Appwrite with TypeScript interfaces
- **State Management**: React Context for auth and profile state
- **Navigation**: Next.js router with protected routes
- **Styling**: Tailwind CSS with shadcn/ui components

## Next Steps

After setting up the database, you can:
1. Test the onboarding flow by creating a new user account
2. Verify profile data is saved correctly in Appwrite
3. Test profile editing functionality
4. Implement additional features like meal planning and logging 