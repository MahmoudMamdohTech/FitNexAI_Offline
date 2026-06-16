// Nutrition Service — direct FastAPI meal plan generation
import api from './api';

export const nutritionService = {
  async generateMealPlan(profile) {
    return await api.post('/api/v1/generate-meal-plan', profile);
  },

  async calculateMacros(profile) {
    return await api.post('/api/v1/calculate-macros', profile);
  },

  async getFoodOptions() {
    const res = await api.get('/api/v1/foods/options');
    return res.foods ?? [];
  },
};
