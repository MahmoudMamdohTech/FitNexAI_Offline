/**
 * planUtils.js — Pure nutrition calculation utilities.
 * 
 * All business logic lives here so dashboardService stays thin
 * and future PHP API migration only requires changing the service layer.
 */

const ACTIVITY_MULTIPLIERS = [1.2, 1.375, 1.55, 1.725, 1.9];

/**
 * Calculate BMR using Mifflin-St Jeor formula.
 * @param {'Male'|'Female'} gender
 * @param {number} weight kg
 * @param {number} height cm
 * @param {number} age years
 */
export const calculateBMR = (gender, weight, height, age) => {
  if (gender === 'Male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  }
  return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
};

/**
 * Calculate TDEE from BMR + activity level.
 * @param {number} bmr
 * @param {number} activityLevel 0-4
 */
export const calculateTDEE = (bmr, activityLevel) => {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  return Math.round(bmr * multiplier);
};

/**
 * Apply caloric adjustment based on goal.
 * @param {number} tdee
 * @param {1|2|3} goal  1=Gain, 2=Loss, 3=Maintain
 */
export const adjustCaloriesForGoal = (tdee, goal) => {
  if (goal === 1) return tdee + 300;  // Bulk
  if (goal === 2) return tdee - 400;  // Cut
  return tdee;                         // Maintain
};

/** Meal option database — replace with real PHP API later */
const MEAL_DATABASE = {
  breakfast: {
    label: 'Breakfast',
    icon: 'wb_sunny',
    options: [
      { name: 'Greek Yogurt with Granola', calories: 425, protein: 31, carbs: 44, fat: 18 },
      { name: 'Oatmeal with Berries & Honey', calories: 380, protein: 12, carbs: 68, fat: 8 },
      { name: 'Scrambled Eggs & Whole-Grain Toast', calories: 410, protein: 28, carbs: 32, fat: 16 },
    ],
    currentIndex: 0,
  },
  lunch: {
    label: 'Lunch',
    icon: 'restaurant',
    options: [
      { name: 'Grilled Chicken Breast Salad', calories: 395, protein: 40, carbs: 25, fat: 18 },
      { name: 'Quinoa Buddha Bowl', calories: 420, protein: 18, carbs: 58, fat: 16 },
      { name: 'Turkey & Avocado Wrap', calories: 450, protein: 35, carbs: 42, fat: 20 },
    ],
    currentIndex: 0,
  },
  dinner: {
    label: 'Dinner',
    icon: 'dinner_dining',
    options: [
      { name: 'Shrimp & Vegetable Skewers', calories: 351, protein: 32, carbs: 28, fat: 15 },
      { name: 'Lean Beef Stir-Fry with Rice', calories: 480, protein: 36, carbs: 48, fat: 18 },
      { name: 'Baked Salmon with Sweet Potato', calories: 440, protein: 38, carbs: 40, fat: 16 },
    ],
    currentIndex: 0,
  },
  snack: {
    label: 'Snack',
    icon: 'cookie',
    options: [
      { name: 'Protein Bar', calories: 200, protein: 20, carbs: 18, fat: 8 },
      { name: 'Apple with Almond Butter', calories: 180, protein: 6, carbs: 22, fat: 10 },
      { name: 'Cottage Cheese & Pineapple', calories: 160, protein: 22, carbs: 14, fat: 3 },
    ],
    currentIndex: 0,
  },
};

/**
 * Generate a full nutrition plan from user preferences.
 * Structure is designed to be 1:1 replaceable by a PHP API response.
 * 
 * TODO (PHP migration): Replace this function with:
 *   return fetch(`${import.meta.env.VITE_API_URL}/api/plan/generate`, {
 *     method: 'POST',
 *     body: JSON.stringify(preferences),
 *     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
 *   }).then(r => r.json());
 */
export const generateNutritionPlan = (preferences = {}) => {
  const { gender = 'Male', weight = 70, height = 175, age = 25, activity_level = 2, goal = 3 } = preferences;

  const bmr = calculateBMR(gender, weight, height, age);
  const tdee = calculateTDEE(bmr, activity_level);
  const dailyCalories = adjustCaloriesForGoal(tdee, goal);

  return {
    dailyCalories,
    dailyProtein: Math.round((dailyCalories * 0.30) / 4),
    dailyCarbs: Math.round((dailyCalories * 0.40) / 4),
    dailyFat: Math.round((dailyCalories * 0.30) / 9),
    ...MEAL_DATABASE,
  };
};
