// User Service — profile management and onboarding
import api from './api';

export const userService = {
  async getProfile() {
    const raw = localStorage.getItem('fitnex_user');
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached) return cached;
    }
    return await api.get('/api/v1/users/profile');
  },

  // saves preferences, generates meal plan, and caches everything
  async savePreferences(preferences) {
    const activityMap = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
    const goalMap     = { 1: 'bulk', 2: 'cut', 3: 'maintain' };
    const dietMap     = { 0: 'none', 1: 'vegetarian', 2: 'vegan' };

    const gender         = (preferences.gender || 'male').toLowerCase();
    const goal           = goalMap[preferences.goal] ?? 'maintain';
    const activityLevel  = activityMap[preferences.activity_level] ?? 'moderate';
    const isVegetarian   = preferences.diet === 1;
    const isVegan        = preferences.diet === 2;

    // step 1: save profile
    await api.post('/api/v1/users/setup', {
      age:            preferences.age,
      gender,
      weight:         preferences.weight,
      height:         preferences.height,
      activity_level: activityLevel,
      goal,
      vegetarian:     isVegetarian,
      vegan:          isVegan,
    });

    // step 2: generate nutrition plan
    const nutritionProfile = {
      gender,
      age:                Number(preferences.age),
      height_cm:          Number(preferences.height),
      weight_kg:          Number(preferences.weight),
      goal,
      activity_level:     activityLevel,
      dietary_preference: dietMap[preferences.diet] ?? 'none',
      favorite_foods:     preferences.favorites ?? [],
      disliked_foods:     preferences.dislikes  ?? [],
      allergies:          preferences.medical   ?? [],
    };

    const plan = await api.post('/api/v1/generate-meal-plan', nutritionProfile);

    // step 3: save plan to DB
    await api.post('/api/v1/plan', { plan }).catch(e =>
      console.warn('Failed to save plan:', e)
    );

    // step 4: cache locally so dashboard loads instantly
    const raw = localStorage.getItem('fitnex_user');
    if (raw) {
      const cached = JSON.parse(raw);
      localStorage.setItem('fitnex_user', JSON.stringify({
        ...cached,
        preferences,
        hasPreferences: true,
        is_setup_completed: true,
        nutritionPlan: plan,
      }));
    }

    return { success: true };
  },
};
