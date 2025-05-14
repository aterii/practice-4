import { configureStore } from '@reduxjs/toolkit';
import carsReducer from './slices/carsSlice';
import preferencesReducer from './slices/preferencesSlice';
import comparisonsReducer from './slices/comparisonsSlice';
import authReducer from './slices/authSlice';
import ahpReducer from './slices/ahpSlice';
import favoritesReducer from './slices/favoritesSlice';

export const store = configureStore({
  reducer: {
    cars: carsReducer,
    preferences: preferencesReducer,
    comparisons: comparisonsReducer,
    auth: authReducer,
    ahp: ahpReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 