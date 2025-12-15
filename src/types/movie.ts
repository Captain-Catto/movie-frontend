// Import types from api.ts for internal use
import type { CastMember, CrewMember } from './api';

export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  overview: string;
  posterUrl?: string | null;
  posterPath?: string | null;
  backdropUrl?: string | null;
  backdropPath?: string | null;
  thumbnailUrl?: string | null;
  releaseDate?: string | null;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  genreIds?: number[];
  originalLanguage?: string | null;
  adult?: boolean;
  createdAt?: string;
  lastUpdated?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalItems?: number;
  currentPage?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface MovieResponse {
  success: boolean;
  message: string;
  data: Movie[];
  pagination?: PaginationInfo;
  meta?: {
    isOnDemandSync?: boolean;
    loadedFromCache?: boolean;
    page?: number;
    appliedFilters?: {
      genre: string | null;
      year: number | null;
      language: string;
    };
  };
  error?: string;
}

export interface MovieQuery {
  page?: number;
  limit?: number;
  genre?: string;
  year?: number;
  language?: string;
  sortBy?: string;
  countries?: string;
}

export interface TrendingItem extends Movie {
  mediaType: "movie" | "tv" | string;
  thumbnailUrl?: string | null;
  isHidden?: boolean;
  hiddenReason?: string | null;
  hiddenAt?: string | null;
}

export interface TrendingResponse {
  success: boolean;
  message: string;
  data: TrendingItem[];
  pagination?: PaginationInfo;
  error?: string;
}

// Frontend movie interface (current structure)
export interface FrontendMovie {
  id: string;
  tmdbId: number; // Make tmdbId required instead of optional
  title: string;
  aliasTitle: string;
  poster: string;
  href: string;
  watchHref?: string;
  year: number;
  rating?: number;
  duration?: string;
  season?: string;
  episode?: string;
  genre: string;
  genres: string[];
  genreIds?: number[];
  description?: string;
  backgroundImage?: string;
  posterImage?: string;
  scenes?: string[];
  isComplete?: boolean;
  mediaType?: "movie" | "tv"; // Added for favorites tracking
}

// TV Series interfaces
export interface TVSeries {
  id: number;
  tmdbId: number;
  title: string;
  overview: string;
  posterUrl?: string | null;
  posterPath?: string | null;
  backdropUrl?: string | null;
  backdropPath?: string | null;
  thumbnailUrl?: string | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  genreIds?: number[];
  originalLanguage?: string | null;
  originCountry?: string[];
  adult?: boolean;
  numberOfEpisodes?: number;
  numberOfSeasons?: number;
  episodeRunTime?: number[];
  status?: string;
  inProduction?: boolean;
  createdAt?: string;
  lastUpdated?: string;
  created_by?: Array<{ id: number; name: string; [key: string]: unknown }>;
  type?: string;
  originalTitle?: string | null;
  production_countries?: Array<{ name: string; iso_3166_1: string }>;
}

export interface TVSeriesResponse {
  success: boolean;
  message: string;
  data:
    | TVSeries[]
    | {
        data: TVSeries[];
        pagination?: PaginationInfo;
      };
  pagination?: PaginationInfo;
  meta?: {
    isOnDemandSync?: boolean;
    loadedFromCache?: boolean;
    page?: number;
    appliedFilters?: {
      genre: string | null;
      year: number | null;
      language: string;
    };
  };
  error?: string;
}

// Frontend TV series interface
export interface FrontendTVSeries {
  id: string;
  tmdbId: number;
  title: string;
  aliasTitle: string;
  poster: string;
  href: string;
  watchHref?: string;
  year: number;
  rating?: number;
  duration?: string;
  episodeNumber?: number;
  totalEpisodes?: number;
  isComplete?: boolean;
  numberOfSeasons?: number;
  genre: string;
  genres: string[];
  genreIds?: number[];
  description?: string;
  backgroundImage?: string;
  posterImage?: string;
  scenes?: string[];
}

export interface Category {
  id: string;
  name: string;
  backgroundImage: string;
}

// Video/Trailer interfaces
export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}

// Additional types for API responses and data structures
export interface Director {
  id: number;
  name: string;
}

export interface MovieDetail {
  id: number;
  tmdbId: number;
  title: string;
  aliasTitle?: string;
  rating: number;
  year: number;
  runtime: string;
  genres: string[];
  genreIds: number[];
  description: string;
  backgroundImage: string;
  posterImage: string;
  director: Director | null;
  cast: CastMember[];
  country: string;
  status: string;
  quality: string;
  language: string;
  contentType: "movie" | "tv";
  voteCount?: number;
  popularity?: number;
  scenes: string[];
}

export interface TVDetail {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle: string;
  overview: string;
  firstAirDate: string;
  lastAirDate?: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  posterPath: string;
  backdropPath: string;
  genres: string[];
  genreIds: number[];
  numberOfEpisodes: number;
  numberOfSeasons: number;
  episodeRunTime: number[];
  status: string;
  type?: string;
  adult: boolean;
  inProduction: boolean;
  originCountry: string[];
  originalLanguage: string;
  createdBy: Array<{ id: number; name: string }>;
  productionCountries: Array<{ name: string; iso_3166_1: string }>;
  creator: Director | null;
  country: string;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CreditsResponse {
  cast: CastMember[];
  crew: CrewMember[];
  production_countries?: Array<{ name: string; iso_3166_1: string }>;
  origin_country?: string[];
  runtime?: number;
  status?: string;
  created_by?: Array<{ id: number; name: string }>;
}

/**
 * Universal card data type for displaying movie/TV content in grids and carousels
 * Used across all components that display content cards
 */
export interface MovieCardData {
  id: string;
  tmdbId: number;
  title: string;
  aliasTitle: string;
  poster: string;
  href: string;
  episodeNumber?: number;
  totalEpisodes?: number;
  isComplete?: boolean;
  hasSubtitle?: boolean;
  isDubbed?: boolean;
  year?: number;
  rating?: number;
  genre?: string;
  genres?: string[];
  genreIds?: number[];
  duration?: string;
  description?: string;
  backgroundImage?: string;
  posterImage?: string;
  scenes?: string[];
}

/**
 * Input type for movie/TV data mapping from API responses
 * Handles both snake_case (TMDB API) and camelCase (backend) formats
 */
export interface MovieInput {
  id?: number; // TMDB ID from API responses (may be optional in some endpoints)
  tmdbId?: number; // TMDB ID from backend (may be optional in some endpoints)
  title?: string;
  original_title?: string; // snake_case from TMDB API
  originalTitle?: string; // camelCase from backend
  name?: string; // for TV series
  original_name?: string; // for TV series snake_case
  originalName?: string; // for TV series camelCase
  overview?: string;
  posterPath?: string | null;
  poster_path?: string | null; // snake_case from TMDB API
  posterUrl?: string | null; // from backend API
  backdropPath?: string | null;
  backdrop_path?: string | null; // snake_case from TMDB API
  backdropUrl?: string | null; // from backend API
  releaseDate?: string | Date | null;
  release_date?: string | null; // snake_case from TMDB API
  first_air_date?: string | null; // for TV series (snake_case)
  firstAirDate?: string | Date | null; // for TV series (camelCase from backend)
  voteAverage?: number;
  vote_average?: number; // snake_case from TMDB API
  genreIds?: (string | number)[] | null;
  genre_ids?: (string | number)[] | null; // snake_case from TMDB API
  media_type?: string; // "movie" or "tv"
  mediaType?: string; // camelCase version
  [key: string]: unknown; // Allow for additional properties
}
