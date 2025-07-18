# Simple User Profiles Setup

## 🎯 What We're Doing
Setting up a simple, secure user profiles system where:
- Users can create their own profiles
- Users can only access their own data
- No complex permissions needed

## 🚀 Quick Setup (3 Steps)

### Step 1: Create API Key
1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project (ID: `6854d601002800d85e1a`)
3. Go to **Settings** → **API Keys** → **Create API Key**
4. Name: `FuelWarden Setup`
5. **Add these permissions:**
   - `databases.read`, `databases.write`
   - `collections.read`, `collections.write`
   - `documents.read`, `documents.write`, `documents.delete`
   - `attributes.read`, `attributes.write`
   - `indexes.read`, `indexes.write`
6. Copy the API key

### Step 2: Set Environment Variables
Create `.env.local` in your project root:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6854d601002800d85e1a
APPWRITE_API_KEY=your_api_key_here
```

### Step 3: Run Setup
```bash
npm run setup-user-profiles
```

## 🔧 How It Works

### Collection Permissions
- **CREATE**: `users` (any authenticated user can create documents)
- **READ/UPDATE/DELETE**: Empty (no collection-level access)

### Document Permissions
When a user creates a profile, the document gets these permissions:
```javascript
[
  Permission.read(Role.user(userId)),    // Only this user can read
  Permission.update(Role.user(userId)),  // Only this user can update
  Permission.delete(Role.user(userId))   // Only this user can delete
]
```

### Security Benefits
- ✅ Users can only access their own data
- ✅ No user can see another user's profile
- ✅ Simple and secure by default
- ✅ Follows Appwrite best practices

## 🧪 Test Your Setup

1. **Run the setup script:**
   ```bash
   npm run setup-user-profiles
   ```

2. **Test in your app:**
   - Complete the onboarding flow with a new user
   - Verify profile data is saved correctly
   - Check that users can only access their own data

## 📋 What Gets Created

### Database: `fuelwarden`
### Collection: `user_profiles`

**Attributes:**
- `userId` (String, required, indexed)
- `age` (Integer, 13-120, required)
- `weightPounds` (Float, 50-500, required)
- `heightInches` (Integer, 48-96, required)
- `sex` (Enum: Male/Female/Non-Binary/Other, required)
- `wakeupTime` (String, optional)
- `bedTime` (String, optional)
- `restrictions` (String[], required)
- `preferences` (String[], required)
- `goals` (String[], required)
- `activities` (String[], required)
- `supplements` (String[], optional)

**Index:**
- `userId` (Key index for fast queries)

## 🎉 That's It!

Your user profiles system is now ready. Users can:
- Create profiles during onboarding
- Update their profiles
- Only access their own data
- Have their data automatically secured

---

**Next:** Test the onboarding flow and profile management in your app!