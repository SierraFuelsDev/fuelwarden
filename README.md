# FuelWarden

A personalized meal planning platform for athletes and fitness enthusiasts, powered by AI and built with Next.js and Appwrite.

## Features

- **Multi-step onboarding** with comprehensive profile collection
- **Weekly fitness schedule** planning with activity tracking
- **AI-powered meal planning** tailored to your goals and schedule
- **Meal logging** with nutritional tracking
- **Personalized recommendations** based on your preferences and restrictions
- **Responsive design** that works on all devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- Appwrite account
- Environment variables configured

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Set up Appwrite collections:
   ```bash
   npm run setup-user-profiles
   npm run setup-activity-schedule
   ```
5. Start the development server: `npm run dev`

## Onboarding Flow

The onboarding process collects:

1. **Basic Information** - Age, sex, weight, height
2. **Daily Schedule** - Wake-up and bed times (optional)
3. **Activities** - Preferred fitness activities
4. **Goals** - Fitness and nutrition goals
5. **Dietary Restrictions** - Food allergies and preferences
6. **Food Preferences** - Cooking style and dietary choices
7. **Weekly Fitness Schedule** - Detailed weekly activity planning

The weekly fitness schedule step allows users to:
- Plan activities for each day of the week
- Specify time of day (morning/afternoon/evening)
- Set activity intensity (light/moderate/intense)
- Add duration and optional notes
- Skip days if they don't have a regular routine

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Forms**: React Hook Form, Zod validation
- **Backend**: Appwrite (BaaS)
- **Database**: Appwrite Database
- **Authentication**: Appwrite Auth

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
