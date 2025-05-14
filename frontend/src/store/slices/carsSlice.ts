import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Car } from '../../types/car';
import { carsService } from '../../services/carsService';

interface CarsState {
  items: Car[];
  selectedCars: Car[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  visibleCount: number;
  isLoadingMore: boolean;
}

const initialState: CarsState = {
  items: [],
  selectedCars: [],
  status: 'idle',
  error: null,
  visibleCount: 20,
  isLoadingMore: false,
};

export const fetchCars = createAsyncThunk(
  'cars/fetchCars',
  async () => {
    const response = await carsService.getAllCars();
    return response;
  }
);

export const fetchCarById = createAsyncThunk(
  'cars/fetchCarById',
  async (id: string) => {
    const response = await carsService.getCarById(id);
    return response;
  }
);

const carsSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: {
    addSelectedCar: (state, action) => {
      if (state.selectedCars.length < 3 && !state.selectedCars.find(car => car.id === action.payload.id)) {
        state.selectedCars.push(action.payload);
      }
    },
    removeSelectedCar: (state, action) => {
      state.selectedCars = state.selectedCars.filter(car => car.id !== action.payload);
    },
    clearSelectedCars: (state) => {
      state.selectedCars = [];
    },
    showMoreCars: (state) => {
      state.visibleCount += 20;
    },
    resetVisibleCount: (state) => {
      state.visibleCount = 20;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.visibleCount = 20; // Reset visible count when new cars are fetched
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch cars';
      })
      .addCase(fetchCarById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCarById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add the fetched car to selectedCars if not already present
        if (!state.selectedCars.find(car => car.id === action.payload.id)) {
          state.selectedCars.push(action.payload);
        }
      })
      .addCase(fetchCarById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch car';
      });
  },
});

export const { 
  addSelectedCar, 
  removeSelectedCar, 
  clearSelectedCars,
  showMoreCars, 
  resetVisibleCount 
} = carsSlice.actions;

export default carsSlice.reducer; 