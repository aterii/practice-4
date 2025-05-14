import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { comparisonsService } from '../../services/comparisons';
import { Comparison } from '../../types/comparison';

interface ComparisonsState {
  comparisons: Comparison[];
  loading: boolean;
  error: string | null;
}

const initialState: ComparisonsState = {
  comparisons: [],
  loading: false,
  error: null,
};

export const fetchComparisons = createAsyncThunk(
  'comparisons/fetchComparisons',
  async () => {
    const response = await comparisonsService.getAll();
    return response.map(comparison => ({
      ...comparison,
      id: Number(comparison.id),
      carId: Number(comparison.carId),
      userId: Number(comparison.userId)
    }));
  }
);

export const addComparison = createAsyncThunk(
  'comparisons/addComparison',
  async ({ carId, score }: { carId: number; score: number }) => {
    const response = await comparisonsService.add(carId, score);
    return {
      ...response,
      id: Number(response.id),
      carId: Number(response.carId),
      userId: Number(response.userId)
    };
  }
);

export const updateComparisonScore = createAsyncThunk(
  'comparisons/updateComparisonScore',
  async ({ id, score }: { id: number; score: number }) => {
    const response = await comparisonsService.updateScore(String(id), score);
    return {
      ...response,
      id: Number(response.id),
      carId: Number(response.carId),
      userId: Number(response.userId)
    };
  }
);

export const removeComparison = createAsyncThunk(
  'comparisons/removeComparison',
  async (id: number) => {
    await comparisonsService.remove(String(id));
    return id;
  }
);

const comparisonsSlice = createSlice({
  name: 'comparisons',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComparisons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComparisons.fulfilled, (state, action) => {
        state.loading = false;
        state.comparisons = action.payload;
      })
      .addCase(fetchComparisons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comparisons';
      })
      .addCase(addComparison.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComparison.fulfilled, (state, action) => {
        state.loading = false;
        state.comparisons.push(action.payload);
      })
      .addCase(addComparison.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add comparison';
      })
      .addCase(updateComparisonScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComparisonScore.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.comparisons.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.comparisons[index] = action.payload;
        }
      })
      .addCase(updateComparisonScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update comparison score';
      })
      .addCase(removeComparison.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeComparison.fulfilled, (state, action) => {
        state.loading = false;
        state.comparisons = state.comparisons.filter(c => c.id !== action.payload);
      })
      .addCase(removeComparison.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove comparison';
      });
  },
});

export default comparisonsSlice.reducer; 