import axiosInstance from "@/lib/axios-instance";
import { authStorage } from "@/lib/auth-storage";
import { mapGenreIdsToNames } from "@/utils/genreMapping";
import type {
  AddFavoriteDto,
  Favorite,
  RawFavoritesResponse,
  FavoritesResponse,
  FavoriteQueryParams,
} from "@/types/favorites.types";

export const favoritesService = {
  async getUserFavorites(
    params: FavoriteQueryParams = {}
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

    const favoritesWithGenres = data.favorites.map((favorite: Favorite) => {
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

    const isCurrentlyFavorite = await this.checkIsFavorite(
      data.contentId,
      data.contentType
    );

    try {
      if (isCurrentlyFavorite) {
        await this.removeFromFavorites(data.contentId, data.contentType);
        return { isFavorite: false, message: "Removed from favorites" };
      } else {
        await this.addToFavorites(data);
        return { isFavorite: true, message: "Added to favorites" };
      }
    } catch (error) {
      console.error("❌ Toggle favorite failed:", error);
      throw new Error("Failed to toggle favorite status");
    }
  },

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
      return false;
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
