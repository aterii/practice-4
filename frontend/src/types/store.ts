import { Car } from './car';
import { PreferencesState } from './preferences';

export interface CarState {
  cars: Car[];
  selectedCars: Car[];
  loading: boolean;
  error: string | null;
}

export interface RootState {
  cars: CarState;
  preferences: PreferencesState;
} 