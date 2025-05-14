import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import preferencesApi from '../../services/api';

export interface UserPreferences {
  usagePurpose: string[];
  maxBudget: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  minPower: number;
  maxFuelConsumption: number;
  safetyFeatures: { [key: string]: boolean };
  comfortFeatures: { [key: string]: boolean };
  criteriaWeights?: { [key: string]: number } | null;
}

interface PreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

const initialState: PreferencesState = {
  preferences: null,
  loading: false,
  error: null,
};

export const fetchPreferences = createAsyncThunk(
  'preferences/fetchPreferences',
  async () => {
    const response = await preferencesApi.get('/preferences');
    return response.data;
  }
);

export const updatePreferences = createAsyncThunk(
  'preferences/updatePreferences',
  async (preferences: Partial<UserPreferences>) => {
    const response = await preferencesApi.post('/preferences', preferences);
    return response.data;
  }
);

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch preferences';
      })
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update preferences';
      });
  },
});

export default preferencesSlice.reducer; 