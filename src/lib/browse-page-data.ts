import { DEFAULT_BROWSE_PAGE_SIZE } from "@/constants/app.constants";
import type { SearchParamsRecord } from "@/lib/category-page-data";
import { parsePageParam } from "@/lib/category-page-data";
import type { TableFilterOptions } from "@/types/ui";
import type { MovieCardData } from "@/types/content.types";
import {
  getMovieListData,
  getTVListData,
  getTrendingListData,
} from "@/lib/content-list-data";
import type { PageListDataResult } from "@/lib/page-data.types";

export type BrowseFetchType = "movie" | "tv" | "trending";

interface BrowsePageDataOptions {
  currentPage: number;
  fetchType: BrowseFetchType;
  language: string;
  filters: TableFilterOptions;
}

export interface BrowsePageParams {
  currentPage: number;
  fetchType: BrowseFetchType;
  currentFilters: TableFilterOptions;
  paginationQuery: Record<string, string | undefined>;
}

const firstParam = (
  value: string | string[] | undefined
): string | undefined => (Array.isArray(value) ? value[0] : value);

const splitParam = (value: string | string[] | undefined): string[] => {
  const raw = firstParam(value);
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeFetchType = (value: string): BrowseFetchType => {
  if (value === "tv" || value === "trending") {
    return value;
  }
  return "movie";
};

export function getBrowsePageTitle(fetchType: BrowseFetchType): string {
  return getBrowsePageTitleByLanguage(fetchType, "en-US");
}

export function getBrowsePageTitleByLanguage(
  fetchType: BrowseFetchType,
  language: string
): string {
  const isVietnamese = language.toLowerCase().startsWith("vi");

  switch (fetchType) {
    case "tv":
      return isVietnamese ? "📺 Duyệt Phim Bộ" : "📺 Browse TV Series";
    case "trending":
      return isVietnamese ? "🔥 Duyệt Thịnh Hành" : "🔥 Browse Trending";
    default:
      return isVietnamese ? "🎬 Duyệt Phim Lẻ" : "🎬 Browse Movies";
  }
}

export function parseBrowsePageParams(
  params: SearchParamsRecord | undefined
): BrowsePageParams {
  const currentPage = parsePageParam(params?.page);

  const countries = splitParam(params?.countries);
  const genres = splitParam(params?.genres);
  const years = splitParam(params?.years);
  const ratings = splitParam(params?.ratings);
  const versions = splitParam(params?.versions);
  const qualities = splitParam(params?.qualities);
  const languages = splitParam(params?.languages);
  const customYear = firstParam(params?.customYear) || "";
  const sortBy = firstParam(params?.sortBy) || "popularity";
  const typeParam = firstParam(params?.type);
  const movieTypeParam = firstParam(params?.movieType);
  const movieType = typeParam || movieTypeParam || "";
  const fetchType = normalizeFetchType(movieType || "movie");

  const currentFilters: TableFilterOptions = {
    countries,
    movieType,
    genres,
    years,
    customYear,
    sortBy,
    ratings,
    versions,
    qualities,
    languages,
  };

  const paginationQuery: Record<string, string | undefined> = {
    countries: countries.length ? countries.join(",") : undefined,
    genres: genres.length ? genres.join(",") : undefined,
    years: years.length ? years.join(",") : undefined,
    customYear: customYear || undefined,
    sortBy: sortBy !== "popularity" ? sortBy : undefined,
    type: movieType || undefined,
  };

  return {
    currentPage,
    fetchType,
    currentFilters,
    paginationQuery,
  };
}

export async function getBrowsePageData({
  currentPage,
  fetchType,
  language,
  filters,
}: BrowsePageDataOptions): Promise<PageListDataResult<MovieCardData>> {
  const rawYear = filters.customYear || filters.years[0];
  const parsedYear = rawYear ? Number(rawYear) : undefined;
  const year = Number.isFinite(parsedYear) ? parsedYear : undefined;

  const sharedOptions = {
    currentPage,
    limit: DEFAULT_BROWSE_PAGE_SIZE,
    language,
    countries: filters.countries.length ? filters.countries.join(",") : undefined,
    genre: filters.genres.length ? filters.genres.join(",") : undefined,
    year,
    sortBy: filters.sortBy,
  };

  if (fetchType === "tv") {
    return getTVListData(sharedOptions);
  }

  if (fetchType === "trending") {
    return getTrendingListData({
      currentPage,
      limit: DEFAULT_BROWSE_PAGE_SIZE,
      language,
      genres: filters.genres,
    });
  }

  return getMovieListData(sharedOptions);
}
