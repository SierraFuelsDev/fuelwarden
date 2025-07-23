# Database Setup Guide for FuelWarden

## Appwrite Database Configuration

### 1. Database Structure

Create a database named `fuelwarden` with the following collections:

#### Collection: `user_profiles`
- **Document ID**: Auto-generated
- **Attributes**:
  - `userId` (String, required, indexed)
  - `age` (Integer, required)
  - `sex` (Enum, required, values: ["Male", "Female", "Non-Binary", "Other"])
  - `weightPounds` (Integer, required)
  - `heightInches` (Integer, required)
  - `restrictions` (String[], required)
  - `performanceObjective` (String, optional)
  - `trainingCompetition` (String[], optional)
  - `diet` (String[], optional)
  - `activitySchedule` (String[], optional)

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
  - `activities` (String, required) // JSON string of activities array with structure:
    ```json
    [
      {
        "dayOfWeek": "Monday",
        "timeOfDay": "morning",
        "activity": "Lift",
        "intensity": "moderate",
        "durationMinutes": 60,
        "notes": "Focus on legs"
      }
    ]
    ```

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

# Activity Schedule Storage in user_profiles

- The `activitySchedule` field in the `user_profiles` collection is an array of JSON strings.
- Each string represents an `ActivityScheduleItem` (see code for structure).
- This is intentional: there is **no separate collection** for activity schedules.
- The frontend parses these strings into objects for use in the UI.
- When saving, the frontend serializes each activity as a JSON string.

**Note:**
If you change this schema in the future, update both the frontend and this documentation. This avoids confusion and errors like trying to use a separate collection. 