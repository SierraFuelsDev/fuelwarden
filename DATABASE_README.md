# FuelWarden Database Setup Guide

This guide will help you set up the database for your FuelWarden application with proper permissions and user profile management.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6854d601002800d85e1a
APPWRITE_API_KEY=your_api_key_here
```

### 3. Create API Key

1. Go to your [Appwrite Console](https://cloud.appwrite.io/)
2. Navigate to your project
3. Go to "Settings" → "API Keys"
4. Create a new API key with the following permissions:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `documents.read`
   - `documents.write`
   - `documents.delete`
5. Copy the API key and add it to your `.env.local` file

### 4. Run Database Setup

```bash
npm run setup-db
```

This will automatically create:
- Database: `fuelwarden`
- Collections: `user_profiles`, `meal_logs`, `meal_plans`, `activity_schedule`
- Proper indexes for performance
- User-based permissions

### 5. Test Your Setup

Visit `/test` in your application to run comprehensive tests.

## 📊 Database Schema

### User Profiles Collection

Stores user profile information and preferences.

**Attributes:**
- `userId` (String, required, indexed) - Links to Appwrite user
- `age` (Integer, 13-120, required)
- `weightPounds` (Float, 50-500, required)
- `heightInches` (Integer, 48-96, required)
- `sex` (String, enum: ["male", "female", "other"], required)
- `wakeupTime` (String, optional)
- `bedTime` (String, optional)
- `restrictions` (String[], required) - Dietary restrictions
- `preferences` (String[], required) - Food preferences
- `goals` (String[], required) - Fitness goals
- `activities` (String[], required) - Activity types
- `supplements` (String[], optional) - Supplements taken

### Meal Logs Collection

Stores individual meal entries.

**Attributes:**
- `userId` (String, required, indexed)
- `date` (String, required, indexed)
- `mealType` (String, enum: ["breakfast", "lunch", "dinner", "snack"], required)
- `foods` (String, required) - JSON string of food array
- `totalCalories` (Integer, required)
- `totalProtein` (Float, required)
- `totalCarbs` (Float, required)
- `totalFat` (Float, required)
- `notes` (String, optional)

### Meal Plans Collection

Stores planned meals for specific dates.

**Attributes:**
- `userId` (String, required, indexed)
- `date` (String, required, indexed)
- `meals` (String, required) - JSON string of meals array
- `totalCalories` (Integer, required)
- `totalProtein` (Float, required)
- `totalCarbs` (Float, required)
- `totalFat` (Float, required)

### Activity Schedule Collection

Stores workout and activity information.

**Attributes:**
- `userId` (String, required, indexed)
- `date` (String, required, indexed)
- `activities` (String, required) - JSON string of activities array
- `totalDuration` (Integer, required) - Total minutes
- `totalCaloriesBurned` (Integer, required)

## 🔐 Permissions

All collections use user-based permissions:

- **Create**: Users can only create documents with their own `userId`
- **Read**: Users can only read documents with their own `userId`
- **Update**: Users can only update documents with their own `userId`
- **Delete**: Users can only delete documents with their own `userId`

This ensures complete data isolation between users.

## 🛠️ Database Operations

### User Profile Management

```typescript
import { databaseService } from '../lib/database';

// Create a new profile
const profile = await databaseService.createUserProfile({
  userId: user.$id,
  age: 25,
  weightPounds: 150,
  heightInches: 70,
  sex: "male",
  restrictions: ["gluten-free"],
  preferences: ["high-protein"],
  goals: ["build-muscle"],
  activities: ["strength_training"],
});

// Get user profile
const profile = await databaseService.getUserProfile(userId);

// Update profile
const updatedProfile = await databaseService.updateUserProfile(profileId, {
  age: 26,
  supplements: ["protein-powder"]
});

// Delete profile
await databaseService.deleteUserProfile(profileId, userId);

// Upsert profile (create or update)
const profile = await databaseService.upsertUserProfile(profileData);
```

### Meal Management

```typescript
// Create meal log
const mealLog = await databaseService.createMealLog({
  userId: user.$id,
  date: "2024-01-15",
  mealType: "breakfast",
  foods: [/* food array */],
  totalCalories: 500,
  totalProtein: 25,
  totalCarbs: 60,
  totalFat: 15
});

// Get user's meal logs
const mealLogs = await databaseService.getUserMealLogs(userId, "2024-01-15");
```

### Activity Management

```typescript
// Create activity schedule
const activity = await databaseService.createActivitySchedule({
  userId: user.$id,
  date: "2024-01-15",
  activities: [/* activities array */],
  totalDuration: 60,
  totalCaloriesBurned: 300
});

// Get user's activities
const activities = await databaseService.getUserActivitySchedules(userId, "2024-01-15");
```

## 🔍 Testing

### Automated Tests

Visit `/test` in your application to run comprehensive tests that verify:

1. Database connection
2. User profile CRUD operations
3. Permission validation
4. Data validation
5. Error handling

### Manual Testing

1. **Onboarding Flow**:
   - Create a new account
   - Complete the onboarding form
   - Verify profile is saved
   - Check profile data on dashboard

2. **Profile Management**:
   - Go to Profile page
   - Update information
   - Save changes
   - Verify persistence

3. **Data Isolation**:
   - Create multiple accounts
   - Verify users can't access each other's data

## 🚨 Troubleshooting

### Common Issues

1. **"Collection not found" error**:
   - Run `npm run setup-db` to create missing collections
   - Check that your API key has proper permissions

2. **"Permission denied" error**:
   - Verify user is authenticated
   - Check that collection permissions are set to `users` role
   - Ensure `userId` field matches the authenticated user's ID

3. **"Invalid data" error**:
   - Check that all required fields are provided
   - Verify data types match schema (e.g., age is number, not string)
   - Ensure enum values are correct

4. **"Database connection failed"**:
   - Verify your Appwrite endpoint and project ID
   - Check that your API key is valid
   - Ensure your Appwrite project is active

### Debug Mode

Enable detailed logging by adding to your `.env.local`:

```env
NEXT_PUBLIC_DEBUG=true
```

This will show detailed database operation logs in the browser console.

## 📈 Performance Optimization

### Indexes

The setup script creates the following indexes for optimal performance:

- `userId` on all collections
- `date` on meal and activity collections
- Composite `userId_date` indexes for date-based queries

### Query Optimization

- Always filter by `userId` first
- Use date ranges for time-based queries
- Limit result sets when possible
- Use pagination for large datasets

## 🔄 Data Migration

If you need to modify the database schema:

1. Create a migration script in `scripts/migrations/`
2. Test the migration on a development database
3. Backup production data before running migrations
4. Run migrations during maintenance windows

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the test results at `/test`
3. Check the browser console for detailed error messages
4. Verify your Appwrite console for any service issues

## 🔒 Security Best Practices

1. **Never expose API keys** in client-side code
2. **Always validate user input** before saving to database
3. **Use user-based permissions** to ensure data isolation
4. **Regularly audit** your database permissions
5. **Monitor** database usage and performance
6. **Backup** your data regularly
7. **Use HTTPS** for all API communications 