import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Car } from '../../types/car';

interface CarState {
  cars: Car[];
  selectedCars: Car[];
  loading: boolean;
  error: string | null;
}

const initialState: CarState = {
  cars: [],
  selectedCars: [],
  loading: false,
  error: null,
};

export const fetchCars = createAsyncThunk(
  'cars/fetchCars',
  async () => {
    const response = await axios.get<Car[]>('/api/external-cars');
    return response.data;
  }
);

const carSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: {
    selectCar: (state, action: PayloadAction<Car>) => {
      if (!state.selectedCars.find(car => car.id === action.payload.id)) {
        state.selectedCars.push(action.payload);
      }
    },
    removeCar: (state, action: PayloadAction<number>) => {
      state.selectedCars = state.selectedCars.filter(car => car.id !== action.payload);
    },
    clearSelectedCars: (state) => {
      state.selectedCars = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCars.fulfilled, (state, action: PayloadAction<Car[]>) => {
        state.loading = false;
        state.cars = action.payload;
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cars';
      });
  },
});

export const { selectCar, removeCar, clearSelectedCars } = carSlice.actions;
export default carSlice.reducer; 