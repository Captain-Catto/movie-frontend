import { mapGenreIdsToNames } from "@/utils/genreMapping";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api`;

export interface AddFavoriteDto {
  contentId: string;
  contentType: "movie" | "tv";
}

export interface Favorite {
  id: number;
  userid: number;
  contentid: string;
  contenttype: "movie" | "tv";
  createdat: string;
  // Movie/TV data from JOIN - API returns these field names
  title?: string;
  name?: string; // For TV shows
  posterpath?: string;
  backdroppath?: string;
  overview?: string;
  voteaverage?: string;
  releasedate?: string;
  firstairdate?: string;
  genreids?: (number | string)[]; // Support both string and number for backend compatibility
  genres?: string[];
}

export interface RawFavoritesResponse {
  favorites: Favorite[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FavoritesResponse {
  favorites: ProcessedFavorite[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ProcessedFavorite {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  genres: string[];
  media_type: "movie" | "tv";
}

export interface SimpleFavoriteQueryParams {
  page?: number;
  limit?: number;
}

export const favoritesService = {
  async getUserFavorites(
    params: SimpleFavoriteQueryParams = {}
  ): Promise<FavoritesResponse> {
    const { page = 1, limit = 20 } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const url = `${API_URL}/favorites?${queryParams.toString()}`;

    const token = localStorage.getItem("authToken");

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch favorites");
    }

    const data: RawFavoritesResponse = await response.json();

    // Map genreIds to genre names for each favorite
    const favoritesWithGenres = data.favorites.map((favorite: Favorite) => {
      // Map API response fields to expected interface fields
      const numericGenreIds = favorite.genreids
        ? favorite.genreids.map((id: string | number) =>
            typeof id === "string" ? parseInt(id, 10) : id
          )
        : [];

      const mappedGenres =
        numericGenreIds.length > 0 ? mapGenreIdsToNames(numericGenreIds) : [];

      return {
        id: parseInt(favorite.contentid, 10),
        title: favorite.title,
        name: favorite.name,
        poster_path: favorite.posterpath,
        backdrop_path: favorite.backdroppath,
        overview: favorite.overview,
        release_date: favorite.releasedate,
        first_air_date: favorite.firstairdate,
        vote_average: favorite.voteaverage
          ? parseFloat(favorite.voteaverage)
          : 0,
        genre_ids: numericGenreIds,
        genres: mappedGenres,
        media_type: favorite.contenttype || "movie",
      };
    });

    return {
      favorites: favoritesWithGenres,
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
      hasMore: data.hasMore,
    };
  },

  async addToFavorites(data: AddFavoriteDto): Promise<Favorite> {
    const url = `${API_URL}/favorites`;

    // Try to get token from different sources
    const authToken = localStorage.getItem("authToken");
    const nextAuthToken = localStorage.getItem("next-auth.session-token");

    console.log("🔍 authToken:", authToken ? "exists" : "null");
    console.log("🔍 nextAuthToken:", nextAuthToken ? "exists" : "null");

    const token = authToken; // Use custom auth token first

    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    console.log("🚀 Making request to:", url);
    console.log("🚀 With data:", data);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Response error:", errorText);
      throw new Error(
        `Failed to add to favorites: ${response.status} ${errorText}`
      );
    }

    return response.json();
  },

  async removeFromFavorites(
    contentId: string,
    contentType: "movie" | "tv"
  ): Promise<{ message: string }> {
    const url = `${API_URL}/favorites`;
    const token = localStorage.getItem("authToken");

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contentId, contentType }),
    });

    if (!response.ok) {
      throw new Error("Failed to remove from favorites");
    }

    // Handle empty response body gracefully
    const responseText = await response.text();
    if (!responseText) {
      return { message: "Removed from favorites" };
    }

    try {
      return JSON.parse(responseText);
    } catch {
      console.warn("Response not JSON, treating as success:", responseText);
      return { message: "Removed from favorites" };
    }
  },

  async toggleFavorite(
    data: AddFavoriteDto
  ): Promise<{ isFavorite: boolean; message: string }> {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    // Check current state first instead of try-add-first
    const isCurrentlyFavorite = await this.checkIsFavorite(
      data.contentId,
      data.contentType
    );

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        await this.removeFromFavorites(data.contentId, data.contentType);
        return { isFavorite: false, message: "Removed from favorites" };
      } else {
        // Add to favorites
        await this.addToFavorites(data);
        return { isFavorite: true, message: "Added to favorites" };
      }
    } catch (error) {
      console.error("❌ Toggle favorite failed:", error);
      throw new Error("Failed to toggle favorite status");
    }
  },

  async checkIsFavorite(
    contentId: string,
    contentType: "movie" | "tv"
  ): Promise<boolean> {
    try {
      // Use existing getUserFavorites to check if item exists
      // We'll get all favorites and check if contentId exists
      const response = await this.getUserFavorites({ page: 1, limit: 1000 });

      // Check if the contentId exists in favorites list
      return response.favorites.some(
        (fav) =>
          fav.id.toString() === contentId && fav.media_type === contentType
      );
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false; // Default to false if check fails
    }
  },

  async getUserStats(): Promise<{ totalFavorites: number }> {
    const url = `${API_URL}/favorites/stats`;
    const token = localStorage.getItem("authToken");

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user stats");
    }

    return response.json();
  },
};
