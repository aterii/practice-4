import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ahpService } from '../../services/ahpService';

interface AHPState {
  matrix: number[][];
  weights: number[];
  CR: number | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AHPState = {
  matrix: [],
  weights: [],
  CR: null,
  status: 'idle',
  error: null,
};

export const fetchAHPComparison = createAsyncThunk(
  'ahp/fetchAHPComparison',
  async () => {
    return await ahpService.getComparison();
  }
);

export const saveAHPComparison = createAsyncThunk(
  'ahp/saveAHPComparison',
  async (matrix: number[][]) => {
    return await ahpService.saveComparison(matrix);
  }
);

const ahpSlice = createSlice({
  name: 'ahp',
  initialState,
  reducers: {
    setMatrix(state, action: PayloadAction<number[][]>) {
      state.matrix = action.payload;
    },
    updateMatrixCell(state, action: PayloadAction<{ row: number; col: number; value: number }>) {
      const { row, col, value } = action.payload;
      if (state.matrix[row]) {
        state.matrix[row][col] = value;
      }
    },
    resetAHP(state) {
      state.matrix = [];
      state.weights = [];
      state.CR = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAHPComparison.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAHPComparison.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.matrix = action.payload.matrix;
        state.weights = action.payload.weights;
        state.CR = action.payload.CR;
      })
      .addCase(fetchAHPComparison.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка загрузки данных AHP';
      })
      .addCase(saveAHPComparison.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveAHPComparison.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.weights = action.payload.weights;
        state.CR = action.payload.CR;
      })
      .addCase(saveAHPComparison.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка сохранения данных AHP';
      });
  },
});

export const { setMatrix, updateMatrixCell, resetAHP } = ahpSlice.actions;
export default ahpSlice.reducer; 