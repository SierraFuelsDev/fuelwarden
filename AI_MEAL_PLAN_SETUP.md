# AI Meal Plan Generation Setup

This document explains how to set up and use the AI meal plan generation functionality in FuelWarden.

## Overview

The AI meal plan generation system uses an Appwrite function (ID: `68817b70e4fe9380573a`) to create personalized meal plans based on user profiles and activity schedules. The system:

1. **Collects user data** from profiles and activity schedules
2. **Sends data to AI function** via Appwrite Functions
3. **Receives structured meal plans** with nutritional information
4. **Stores plans in database** for display and management
5. **Displays plans** in a beautiful, interactive UI

## Setup Instructions

### 1. Database Setup

First, create the meal_plans collection in Appwrite:

```bash
npm run setup-meal-plans
```

This script will:
- Create the `meal_plans` collection
- Set up all required attributes
- Configure proper indexes
- Set up user permissions

### 2. Appwrite Function Configuration

The AI function (ID: `68817b70e4fe9380573a`) should be configured with:

- **Runtime**: Node.js
- **Template**: Prompt ChatGPT
- **Environment Variables**: 
  - `OPENAI_API_KEY` - Your OpenAI API key
  - `OPENAI_MODEL` - Model to use (e.g., "gpt-4")

### 3. Function Input/Output Format

#### Input Data Structure
The function receives user data in this format:

```json
{
  "userProfile": {
    "age": 25,
    "sex": "male",
    "weightPounds": 180,
    "heightInches": 72,
    "restrictions": ["gluten"],
    "performanceObjective": "in-season-peak",
    "trainingCompetition": ["basketball"],
    "diet": ["high-protein"]
  },
  "activitySchedule": [
    {
      "dayOfWeek": "Monday",
      "timeOfDay": "morning",
      "activity": "Lift",
      "intensity": "moderate",
      "durationMinutes": 60,
      "notes": "Focus on legs"
    }
  ]
}
```

#### Expected Output Format
The function should return:

```json
{
  "success": true,
  "mealPlan": [
    {
      "dayOfWeek": "Monday",
      "meals": {
        "breakfast": {
          "name": "Protein Oatmeal Bowl",
          "description": "High-protein breakfast with complex carbs",
          "calories": 450,
          "protein": 25,
          "carbs": 65,
          "fat": 12,
          "ingredients": ["oats", "protein powder", "banana", "almonds"],
          "instructions": ["Cook oats", "Add protein powder", "Top with banana and almonds"],
          "prepTime": 10,
          "cookTime": 5,
          "difficulty": "easy",
          "tags": ["high-protein", "quick", "breakfast"]
        },
        "lunch": {
          "name": "Grilled Chicken Salad",
          "description": "Lean protein with fresh vegetables",
          "calories": 380,
          "protein": 35,
          "carbs": 15,
          "fat": 18,
          "ingredients": ["chicken breast", "mixed greens", "tomatoes", "olive oil"],
          "instructions": ["Grill chicken", "Chop vegetables", "Assemble salad"],
          "prepTime": 15,
          "cookTime": 12,
          "difficulty": "medium",
          "tags": ["high-protein", "low-carb", "lunch"]
        },
        "dinner": {
          "name": "Salmon with Quinoa",
          "description": "Omega-3 rich fish with complete protein grain",
          "calories": 520,
          "protein": 42,
          "carbs": 45,
          "fat": 22,
          "ingredients": ["salmon fillet", "quinoa", "broccoli", "lemon"],
          "instructions": ["Cook quinoa", "Bake salmon", "Steam broccoli"],
          "prepTime": 10,
          "cookTime": 20,
          "difficulty": "medium",
          "tags": ["high-protein", "omega-3", "dinner"]
        },
        "snacks": [
          {
            "name": "Greek Yogurt with Berries",
            "description": "Protein-rich snack with antioxidants",
            "calories": 120,
            "protein": 15,
            "carbs": 12,
            "fat": 2,
            "ingredients": ["greek yogurt", "mixed berries", "honey"],
            "instructions": ["Mix yogurt with berries", "Drizzle with honey"],
            "prepTime": 5,
            "difficulty": "easy",
            "tags": ["high-protein", "quick", "snack"]
          }
        ]
      },
      "totalCalories": 1470,
      "totalProtein": 117,
      "totalCarbs": 137,
      "totalFat": 54,
      "notes": "High protein day to support morning lifting session"
    }
  ]
}
```

## Usage

### 1. Generate Meal Plan

Users can generate meal plans from the `/mealPlan` page:

```typescript
// Generate new meal plan
const newPlan = await databaseService.generateAIMealPlan(userId);
```

### 2. View Current Plan

```typescript
// Get user's current active meal plan
const currentPlan = await databaseService.getCurrentMealPlan(userId);
```

### 3. Test Functionality

Use the test page at `/test-ai-meal-plan` to:
- Load and display user data
- Test AI function integration
- Verify meal plan generation
- Debug any issues

## Database Schema

### meal_plans Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | String | Yes | User ID |
| status | Enum | Yes | draft/active/archived |
| version | Integer | Yes | Plan version number |
| generatedAt | String | Yes | Generation timestamp |
| meals | String | Yes | JSON string of meal plan |
| planDateRange | String | Yes | JSON string of date range |
| totalCalories | Integer | Yes | Total calories for week |
| totalProtein | Float | Yes | Total protein for week |
| totalCarbs | Float | Yes | Total carbs for week |
| totalFat | Float | Yes | Total fat for week |
| type | String | No | Plan type (e.g., "ai_generated") |

## Error Handling

The system handles various error scenarios:

1. **User profile not found** - Prompts user to complete onboarding
2. **AI function failure** - Shows error message with retry option
3. **Database errors** - Graceful fallback with user feedback
4. **Network issues** - Automatic retry with exponential backoff

## Performance Considerations

- **Caching**: Meal plans are cached in the database
- **Async processing**: AI function calls are non-blocking
- **Error recovery**: Failed generations can be retried
- **Data validation**: All inputs are validated before processing

## Security

- **User isolation**: Users can only access their own meal plans
- **Input validation**: All user data is validated
- **API key protection**: OpenAI key is stored securely in Appwrite
- **Rate limiting**: Function calls are rate-limited to prevent abuse

## Troubleshooting

### Common Issues

1. **Function not found**: Verify function ID is correct
2. **Permission denied**: Check user authentication
3. **Invalid response format**: Ensure AI function returns correct JSON
4. **Database errors**: Verify collection setup and permissions

### Debug Steps

1. Use the test page to verify user data loading
2. Check browser console for error messages
3. Verify Appwrite function logs
4. Test with minimal user data first

## Next Steps

1. **Enhanced AI prompts** - Improve meal plan quality
2. **Meal logging integration** - Track adherence to plans
3. **Plan customization** - Allow users to modify generated plans
4. **Nutritional goals** - Add specific macro targets
5. **Recipe database** - Expand meal variety and options

## Support

For issues with the AI meal plan generation:

1. Check the test page for debugging information
2. Verify Appwrite function configuration
3. Review function logs for error details
4. Test with different user profiles 