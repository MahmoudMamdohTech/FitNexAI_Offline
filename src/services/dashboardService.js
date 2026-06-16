// Dashboard Service — fetches nutrition plan, falls back to localStorage cache
import api from './api';

export const dashboardService = {
  async getDashboardStats() {
    // try fetching plan from backend
    let plan = null;
    try {
      const res = await api.get('/api/v1/plan');
      plan = res.plan;
    } catch (e) {
      console.warn('Could not fetch plan from backend', e);
    }

    // fallback to localStorage cache
    if (!plan) {
      const raw = localStorage.getItem('fitnex_user');
      if (raw) {
        const user = JSON.parse(raw);
        plan = user.nutritionPlan;
      }
    }

    if (plan) {
      const needs = plan.nutrition_needs;
      const toOptions = (arr) =>
        (arr ?? []).map((o) => ({
          name: o.meal,
          calories: o.calories,
          protein: o.protein,
          carbs: o.carbs,
          fat: o.fats,
        }));

      const fallbackOption = (name, cal, p, c, f) => [{ name, calories: cal, protein: p, carbs: c, fat: f }];

      return {
        dailyCalories: needs?.daily_calories ?? 0,
        dailyProtein: needs?.protein_g ?? 0,
        dailyCarbs: needs?.carb_g ?? 0,
        dailyFat: needs?.fat_g ?? 0,

        breakfast: { label: 'Breakfast', icon: 'wb_twilight', currentIndex: 0, options: toOptions(plan.breakfast_options).length ? toOptions(plan.breakfast_options) : fallbackOption('No breakfast options generated', 0, 0, 0, 0) },
        lunch: { label: 'Midday Fuel', icon: 'light_mode', currentIndex: 0, options: toOptions(plan.lunch_options).length ? toOptions(plan.lunch_options) : fallbackOption('No lunch options generated', 0, 0, 0, 0) },
        dinner: { label: 'Evening Recovery', icon: 'dark_mode', currentIndex: 0, options: toOptions(plan.dinner_options).length ? toOptions(plan.dinner_options) : fallbackOption('No dinner options generated', 0, 0, 0, 0) },
        snack: { label: 'Quick Energy', icon: 'cookie', currentIndex: 0, options: toOptions(plan.snack_options).length ? toOptions(plan.snack_options) : fallbackOption('No snack options generated', 0, 0, 0, 0) },
      };
    }

    throw new Error('No generated meal plan found. Complete preferences first.');
  },

  // swap is client-side index rotation, no backend call needed
  async swapMeal() {
    return { success: true };
  },

  async savePlan() {
    return { success: true };
  },
};
