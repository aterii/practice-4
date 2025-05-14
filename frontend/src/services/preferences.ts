import api from './api';
import { UserPreferences } from '../types/preferences';

export const preferencesService = {
  async get(): Promise<UserPreferences | null> {
    try {
      const response = await api.get('/preferences');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async update(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.put('/preferences', preferences);
    return response.data;
  },

  async updateCriteriaWeights(weights: Record<string, number>): Promise<UserPreferences> {
    const response = await api.put('/preferences/criteria-weights', { weights });
    return response.data;
  }
}; 