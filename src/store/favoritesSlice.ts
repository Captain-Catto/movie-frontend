import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { favoritesService } from "@/services/favorites.service";

interface FavoritesState {
  favoriteIds: number[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  favoriteIds: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const ids = await favoritesService.getUserFavoriteIds();
      const favoriteIds = ids.map((item) => parseInt(item.contentId, 10));
      return favoriteIds;
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
      movieData,
    }: {
      movieId: number;
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
      return { movieId, isFavorite: result.isFavorite };
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
    optimisticToggle: (state, action: PayloadAction<number>) => {
      const movieId = action.payload;
      const index = state.favoriteIds.indexOf(movieId);
      if (index !== -1) {
        // Remove from favorites
        state.favoriteIds.splice(index, 1);
      } else {
        // Add to favorites
        state.favoriteIds.push(movieId);
      }
    },
    // Reset favorites on logout
    clearFavorites: (state) => {
      state.favoriteIds = [];
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
        state.favoriteIds = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle favorite
      .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
        const { movieId, isFavorite } = action.payload;
        const index = state.favoriteIds.indexOf(movieId);

        if (isFavorite && index === -1) {
          // Add to favorites
          state.favoriteIds.push(movieId);
        } else if (!isFavorite && index !== -1) {
          // Remove from favorites
          state.favoriteIds.splice(index, 1);
        }
      })
      .addCase(toggleFavoriteAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { optimisticToggle, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
