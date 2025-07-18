# FuelWarden Onboarding Flow

## Overview
The onboarding flow is a clean, multi-step form designed to collect user profile information for personalized meal planning. It's built with modern React patterns, TypeScript, and follows the FuelWarden architecture.

## Features

### 🎨 Clean UI/UX
- **Multi-step form** with progress indicators
- **Responsive design** that works on all devices
- **Visual feedback** with icons and color-coded steps
- **Smooth transitions** between steps
- **Form validation** with real-time feedback

### 📋 Form Steps

#### Step 1: Basic Information
- **Age** (13-120 years)
- **Sex** (male/female/other)
- **Weight** (50-500 pounds)
- **Height** (48-96 inches)

#### Step 2: Daily Schedule (Optional)
- **Wake-up time** (optional)
- **Bed time** (optional)
- Helps understand daily rhythm for meal timing

#### Step 3: Activities
- **Activity types** (weightlifting, running, yoga, etc.)
- Select up to 3 preferred activities

#### Step 4: Goals
- **Fitness goals** (build muscle, lose weight, improve performance, etc.)
- Select up to 3 main goals

#### Step 5: Dietary Restrictions
- **Dietary restrictions** (gluten-free, dairy-free, vegetarian, etc.)
- Select all that apply

#### Step 6: Food Preferences
- **Food preferences** (high protein, organic, budget conscious, etc.)
- Select all that apply

#### Step 7: Weekly Fitness Schedule
- **Day of week** (Monday through Sunday)
- **Time of day** (morning, afternoon, evening)
- **Activity type** (running, yoga, weightlifting, etc.)
- **Intensity** (light, moderate, intense)
- **Duration** (15-300 minutes, optional)
- **Notes** (optional additional details)
- Users can add multiple activities per day
- Skip days are allowed (no validation requiring activities every day)

### 🔧 Technical Implementation

#### Database Schema
The form collects data for two collections:

**user_profiles collection:**
```typescript
interface UserProfile {
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
}
```

**activity_schedule collection:**
```typescript
interface ActivitySchedule {
  userId: string;
  schedule: ActivityScheduleItem[];
}

interface ActivityScheduleItem {
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  timeOfDay: "morning" | "afternoon" | "evening";
  activity: string;
  intensity: "light" | "moderate" | "intense";
  durationMinutes?: number;
  notes?: string;
}
```

#### Form Validation
- Uses **Zod** for schema validation
- Real-time validation with `react-hook-form`
- Step-by-step validation before proceeding
- Required field validation for preferences and goals
- Optional weekly schedule (users can skip if they don't have a regular routine)

#### Data Validation & Defaults
- **Weekly Schedule**: Optional step - users can skip entirely
- **Empty days**: No validation requiring activities every day
- **Partial data**: Duration and notes are optional
- **Defaults**: New activities default to Monday morning, moderate intensity, 60 minutes
- **Activity limits**: No limit on number of activities per day
- **Duration limits**: 15-300 minutes with 60-minute default

#### UI Components
- **shadcn/ui** components for consistency
- **Tailwind CSS** for styling
- **Lucide React** icons for visual elements
- **Custom Select component** for dropdowns
- **Card-based layout** for activity items

### 🚀 User Experience

#### Progress Tracking
- Visual progress bar with step indicators
- Clear step titles and descriptions
- Icon-based step identification
- Step counter (Step X of 3)

#### Form Interactions
- **Checkbox groups** for multi-select options
- **Radio buttons** for single-choice options
- **Number inputs** with placeholders
- **Time inputs** for schedule information
- **Hover effects** and visual feedback

#### Navigation
- **Previous/Next** buttons with icons
- **Validation** before proceeding to next step
- **Submit** button with loading state
- **Disabled states** for invalid forms

### 🎯 Design Principles

#### Accessibility
- Proper form labels and ARIA attributes
- Keyboard navigation support
- High contrast color scheme
- Clear error messages

#### Mobile-First
- Responsive grid layouts
- Touch-friendly button sizes
- Optimized spacing for mobile devices
- Swipe-friendly interactions

#### Performance
- Lazy loading of form steps
- Efficient state management
- Minimal re-renders
- Optimized validation

## Usage

### For New Users
1. Navigate to `/onboarding` after authentication
2. Complete the 3-step form
3. Data is saved to Appwrite database
4. Redirected to dashboard upon completion

### For Developers
The onboarding form is located at:
- **Component**: `src/components/onboarding/OnboardingForm.tsx`
- **Page**: `src/app/onboarding/page.tsx`
- **Database**: `src/lib/database.ts`

### Customization
- **Options**: Modify the predefined option arrays
- **Validation**: Update Zod schemas
- **Styling**: Customize Tailwind classes
- **Steps**: Add/remove steps by updating the step logic

## Future Enhancements
- [ ] Save progress between sessions
- [ ] Skip optional steps
- [ ] Profile editing after onboarding
- [ ] Import from other fitness apps
- [ ] Photo upload for profile
- [ ] Social login integration 