import { apiService } from "@/services/api";
import type {
  Movie,
  MovieCardData,
  TVSeries,
  TrendingItem,
} from "@/types/content.types";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { mapTVSeriesToFrontendList } from "@/utils/tvMapper";
import { mapTrendingDataToFrontend } from "@/utils/trendingMapper";
import {
  extractCategoryItems,
  extractCategoryPagination,
} from "@/lib/category-page-data";

export interface ContentListResult {
  items: MovieCardData[];
  totalPages: number;
  error: string | null;
}

interface BaseListOptions {
  currentPage: number;
  limit: number;
  language: string;
}

export interface MovieListOptions extends BaseListOptions {
  countries?: string;
  genre?: string;
  year?: number;
  sortBy?: string;
}

export interface TVListOptions extends BaseListOptions {
  countries?: string;
  genre?: string;
  year?: number;
  sortBy?: string;
}

export interface TrendingListOptions extends BaseListOptions {
  genres?: string[];
}

const filterTrendingByGenres = (
  items: TrendingItem[],
  genres: string[]
): TrendingItem[] => {
  if (genres.length === 0) {
    return items;
  }

  const genreFilterIds = genres
    .map((genre) => Number(genre))
    .filter((id) => Number.isFinite(id));

  if (genreFilterIds.length === 0) {
    return items;
  }

  return items.filter((item) => {
    const genreIds = Array.isArray(item.genreIds) ? item.genreIds : [];
    return genreIds.some((genreId) => genreFilterIds.includes(Number(genreId)));
  });
};

export async function getMovieListData({
  currentPage,
  limit,
  language,
  countries,
  genre,
  year,
  sortBy,
}: MovieListOptions): Promise<ContentListResult> {
  try {
    const response = await apiService.getMovies({
      page: currentPage,
      limit,
      language,
      countries,
      genre,
      year,
      sortBy,
    });

    if (!response.success) {
      return {
        items: [],
        totalPages: 1,
        error: response.message || "Failed to fetch movies",
      };
    }

    const items = extractCategoryItems(response.data);
    const mappedItems = mapMoviesToFrontend(items as Movie[]);
    const pagination = extractCategoryPagination(response, mappedItems.length);

    return {
      items: mappedItems,
      totalPages: pagination.totalPages,
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      totalPages: 1,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function getTVListData({
  currentPage,
  limit,
  language,
  countries,
  genre,
  year,
  sortBy,
}: TVListOptions): Promise<ContentListResult> {
  try {
    const response = await apiService.getTVSeries({
      page: currentPage,
      limit,
      language,
      countries,
      genre,
      year,
      sortBy,
    });

    if (!response.success) {
      return {
        items: [],
        totalPages: 1,
        error: response.message || "Failed to fetch TV series",
      };
    }

    const items = extractCategoryItems(response.data);
    const mappedItems = mapTVSeriesToFrontendList(items as TVSeries[]);
    const pagination = extractCategoryPagination(response, mappedItems.length);

    return {
      items: mappedItems,
      totalPages: pagination.totalPages,
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      totalPages: 1,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function getTrendingListData({
  currentPage,
  limit,
  language,
  genres = [],
}: TrendingListOptions): Promise<ContentListResult> {
  try {
    const response = await apiService.getTrending({
      page: currentPage,
      limit,
      language,
    });

    if (!response.success) {
      return {
        items: [],
        totalPages: 1,
        error: response.message || "Failed to fetch trending data",
      };
    }

    const items = extractCategoryItems(response.data) as TrendingItem[];
    const filteredItems = filterTrendingByGenres(items, genres);
    const mappedItems = mapTrendingDataToFrontend(filteredItems);
    const pagination = extractCategoryPagination(response, mappedItems.length);

    return {
      items: mappedItems,
      totalPages: pagination.totalPages,
      error: null,
    };
  } catch (error) {
    return {
      items: [],
      totalPages: 1,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
