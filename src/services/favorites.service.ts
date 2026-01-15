import axiosInstance from "@/lib/axios-instance";
import { authStorage } from "@/lib/auth-storage";
import { mapGenreIdsToNames } from "@/utils/genreMapping";

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

    const token = authStorage.getToken();
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }



    const response = await axiosInstance.get<RawFavoritesResponse>(
      `/favorites?${queryParams.toString()}`
    );

    const data = response.data;

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
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    const response = await axiosInstance.post<Favorite>("/favorites", data);

    return response.data;
  },

  async removeFromFavorites(
    contentId: string,
    contentType: "movie" | "tv"
  ): Promise<{ message: string }> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    const response = await axiosInstance.delete<{ message: string }>(
      "/favorites",
      {
        data: { contentId, contentType },
      }
    );

    return response.data || { message: "Removed from favorites" };
  },

  async toggleFavorite(
    data: AddFavoriteDto
  ): Promise<{ isFavorite: boolean; message: string }> {
    const token = authStorage.getToken();
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

  /**
   * Get only favorite IDs - lightweight for initial load
   * Returns array of {contentId, contentType}
   */
  async getUserFavoriteIds(): Promise<Array<{ contentId: string; contentType: string }>> {
    const token = authStorage.getToken();
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }



    type RawFavoriteId = {
      contentId?: string;
      contentid?: string;
      contentType?: string;
      contenttype?: string;
    };

    const response = await axiosInstance.get<{ ids: RawFavoriteId[]; total: number }>(
      "/favorites/ids"
    );

    // console.log("[favoritesService] Favorite IDs response", response.data);

    // Normalize casing from backend (contentid/contenttype vs contentId/contentType)
    const normalizedIds = response.data.ids.reduce<
      Array<{ contentId: string; contentType: string }>
    >((acc, item) => {
      const contentId = item.contentId ?? item.contentid;
      const contentType = item.contentType ?? item.contenttype;
      if (contentId && contentType) {
        acc.push({ contentId, contentType });
      }
      return acc;
    }, []);

    return normalizedIds;
  },

  /**
   * Check if specific item is favorited - uses dedicated fast endpoint
   * Much faster than fetching all favorites
   */
  async checkIsFavorite(
    contentId: string,
    contentType: "movie" | "tv"
  ): Promise<boolean> {
    try {
      const token = authStorage.getToken();
      if (!token) {
        return false;
      }

      const response = await axiosInstance.get<{ isFavorite: boolean }>(
        `/favorites/check/${contentId}/${contentType}`
      );

      return response.data.isFavorite;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false; // Default to false if check fails
    }
  },

  async getUserStats(): Promise<{ totalFavorites: number }> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    const response = await axiosInstance.get<{ totalFavorites: number }>(
      "/favorites/stats"
    );

    return response.data;
  },
};
