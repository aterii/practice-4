import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  ids: number[];
}

// Инициализация из localStorage
const initialIds = (() => {
  try {
    const data = localStorage.getItem('favoriteCarIds');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
})();

const initialState: FavoritesState = {
  ids: initialIds,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite(state, action: PayloadAction<number>) {
      if (!state.ids.includes(action.payload)) {
        state.ids.push(action.payload);
        localStorage.setItem('favoriteCarIds', JSON.stringify(state.ids));
      }
    },
    removeFavorite(state, action: PayloadAction<number>) {
      state.ids = state.ids.filter(id => id !== action.payload);
      localStorage.setItem('favoriteCarIds', JSON.stringify(state.ids));
    },
    clearFavorites(state) {
      state.ids = [];
      localStorage.setItem('favoriteCarIds', JSON.stringify([]));
    },
  },
});

export const { addFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer; 