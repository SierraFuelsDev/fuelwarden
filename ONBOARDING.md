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

#### Step 3: Preferences & Goals
- **Dietary restrictions** (gluten-free, dairy-free, vegetarian, etc.)
- **Food preferences** (high protein, organic, budget conscious, etc.)
- **Goals** (build muscle, lose weight, improve performance, etc.)
- **Activities** (weightlifting, running, yoga, etc.)
- **Supplements** (protein powder, creatine, etc.)

### 🔧 Technical Implementation

#### Database Schema
The form collects data for the `user_profiles` collection with the following structure:
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
  supplements: string[];
}
```

#### Form Validation
- Uses **Zod** for schema validation
- Real-time validation with `react-hook-form`
- Step-by-step validation before proceeding
- Required field validation for preferences and goals

#### UI Components
- **shadcn/ui** components for consistency
- **Tailwind CSS** for styling
- **Lucide React** icons for visual elements
- **Responsive grid layouts** for optimal mobile experience

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