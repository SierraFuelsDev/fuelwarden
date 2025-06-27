# Database Setup Guide for FuelWarden

## Appwrite Database Configuration

### 1. Database Structure

Create a database named `fuelwarden` with the following collections:

#### Collection: `user_profiles`
- **Document ID**: Auto-generated
- **Attributes**:
  - `userId` (String, required, indexed)
  - `age` (Integer, required)
  - `weightPounds` (Float, required)
  - `heightInches` (Integer, required)
  - `sex` (String, required, enum: ["male", "female", "other"])
  - `wakeupTime` (String, optional)
  - `bedTime` (String, optional)
  - `restrictions` (String[], required)
  - `preferences` (String[], required)
  - `goals` (String[], required)
  - `activities` (String[], required)
  - `supplements` (String[], optional)

#### Collection: `meal_logs`
- **Document ID**: Auto-generated
- **Attributes**:
  - `userId` (String, required, indexed)
  - `date` (String, required, indexed)
  - `mealType` (String, required, enum: ["breakfast", "lunch", "dinner", "snack"])
  - `foods` (String, required) // JSON string of food array
  - `totalCalories` (Integer, required)
  - `totalProtein` (Float, required)
  - `totalCarbs` (Float, required)
  - `totalFat` (Float, required)
  - `notes` (String, optional)

#### Collection: `meal_plans`
- **Document ID**: Auto-generated
- **Attributes**:
  - `userId` (String, required, indexed)
  - `date` (String, required, indexed)
  - `meals` (String, required) // JSON string of meals array
  - `totalCalories` (Integer, required)
  - `totalProtein` (Float, required)
  - `totalCarbs` (Float, required)
  - `totalFat` (Float, required)

#### Collection: `activity_schedule`
- **Document ID**: Auto-generated
- **Attributes**:
  - `userId` (String, required, indexed)
  - `date` (String, required, indexed)
  - `activities` (String, required) // JSON string of activities array
  - `totalDuration` (Integer, required)
  - `totalCaloriesBurned` (Integer, required)

### 2. Permissions Configuration

#### User Profiles Collection Permissions

**Create Permission:**
- Role: `users`
- Condition: `$userId == $userId` (users can only create their own profile)

**Read Permission:**
- Role: `users`
- Condition: `$userId == $userId` (users can only read their own profile)

**Update Permission:**
- Role: `users`
- Condition: `$userId == $userId` (users can only update their own profile)

**Delete Permission:**
- Role: `users`
- Condition: `$userId == $userId` (users can only delete their own profile)

#### Meal Logs Collection Permissions

**Create Permission:**
- Role: `users`
- Condition: `$userId == $userId`

**Read Permission:**
- Role: `users`
- Condition: `$userId == $userId`

**Update Permission:**
- Role: `users`
- Condition: `$userId == $userId`

**Delete Permission:**
- Role: `users`
- Condition: `$userId == $userId`

#### Meal Plans Collection Permissions

**Create Permission:**
- Role: `users`
- Condition: `$userId == $userId`

**Read Permission:**
- Role: `users`
- Condition: `$userId == $userId`

**Update Permission:**
- Role: `users`
- Condition: `$userId == $userId`

**Delete Permission:**
- Role: `users`
- Condition: `$userId == $userId`

#### Activity Schedule Collection Permissions

**Create Permission:**
- Role: `users`
- Condition: `$userId == $userId`

**Read Permission:**
- Role: `users`
- Condition: `$userId == $userId`

**Update Permission:**
- Role: `users`
- Condition: `$userId == $userId`

**Delete Permission:**
- Role: `users`
- Condition: `$userId == $userId`

### 3. Indexes Configuration

For optimal query performance, create the following indexes:

#### User Profiles Collection
- `userId` (Attribute, Key, Required)

#### Meal Logs Collection
- `userId` (Attribute, Key, Required)
- `date` (Attribute, Key, Required)
- `userId_date` (Composite: userId + date)

#### Meal Plans Collection
- `userId` (Attribute, Key, Required)
- `date` (Attribute, Key, Required)
- `userId_date` (Composite: userId + date)

#### Activity Schedule Collection
- `userId` (Attribute, Key, Required)
- `date` (Attribute, Key, Required)
- `userId_date` (Composite: userId + date)

### 4. Security Best Practices

1. **Always validate user authentication** before database operations
2. **Use user-specific queries** to ensure data isolation
3. **Implement proper error handling** for database operations
4. **Log database operations** for debugging and monitoring
5. **Use transactions** for complex operations involving multiple documents
6. **Implement rate limiting** to prevent abuse
7. **Regularly backup** your database
8. **Monitor database usage** and performance

### 5. Environment Variables

Ensure your environment variables are properly configured:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6854d601002800d85e1a
```

### 6. Testing Database Connection

Use the test connection method in your database service to verify everything is working:

```typescript
const result = await databaseService.testConnection();
console.log(result);
```

This will help you verify:
- Database connection
- Collection existence
- User authentication
- Permission configuration 