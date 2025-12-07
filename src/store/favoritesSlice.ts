import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { favoritesService } from "@/services/favorites.service";

interface FavoritesState {
  favoriteKeys: string[]; // `${type}-${id}` to avoid clashes and preserve type
  isLoading: boolean;
  error: string | null;
}

const makeFavoriteKey = (id: string | number, type?: string) =>
  `${type || "movie"}-${id}`;

const initialState: FavoritesState = {
  favoriteKeys: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const ids = await favoritesService.getUserFavoriteIds();
      const favoriteKeys = ids
        .map((item) => ({
          id: item.contentId,
          type: item.contentType,
        }))
        .filter(({ id, type }) => !!id && !!type)
        .map(({ id, type }) => makeFavoriteKey(id, type));
      return favoriteKeys;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch favorites"
      );
    }
  }
);

export const toggleFavoriteAsync = createAsyncThunk(
  "favorites/toggle",
  async (
    {
      movieId,
      movieKey,
      movieData,
    }: {
      movieId: number;
      movieKey: string;
      movieData: {
        mediaType?: "movie" | "tv";
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await favoritesService.toggleFavorite({
        contentId: movieId.toString(),
        contentType: movieData.mediaType || "movie",
      });
      return { movieId, movieKey, isFavorite: result.isFavorite };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to toggle favorite"
      );
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    // Optimistic update
    optimisticToggle: (state, action: PayloadAction<string>) => {
      const movieKey = action.payload;
      const index = state.favoriteKeys.indexOf(movieKey);
      if (index !== -1) {
        // Remove from favorites
        state.favoriteKeys.splice(index, 1);
      } else {
        // Add to favorites
        state.favoriteKeys.push(movieKey);
      }
    },
    // Reset favorites on logout
    clearFavorites: (state) => {
      state.favoriteKeys = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favoriteKeys = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle favorite
      .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
        const { movieKey, isFavorite } = action.payload;
        const index = state.favoriteKeys.indexOf(movieKey);

        if (isFavorite && index === -1) {
          state.favoriteKeys.push(movieKey);
        } else if (!isFavorite && index !== -1) {
          state.favoriteKeys.splice(index, 1);
        }
      })
      .addCase(toggleFavoriteAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        // Revert optimistic update if it was applied
        const movieKey = action.meta.arg.movieKey;
        if (movieKey) {
          const index = state.favoriteKeys.indexOf(movieKey);
          if (index !== -1) {
            state.favoriteKeys.splice(index, 1);
          } else {
            state.favoriteKeys.push(movieKey);
          }
        }
      });
  },
});

export const { optimisticToggle, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
