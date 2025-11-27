// API Response Types - Centralized type definitions for API interactions

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  // Additional fields for person credits
  title?: string;
  original_title?: string;
  media_type?: "movie" | "tv";
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  known_for_department?: string;
  popularity?: number;
  job?: string;
  [key: string]: unknown;
}

export interface CrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string | null;
  // Additional fields for person credits
  title?: string;
  original_title?: string;
  media_type?: "movie" | "tv";
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  [key: string]: unknown;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path?: string;
  origin_country: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CreditsData {
  id: number;
  title?: string;
  name?: string;
  cast: CastMember[];
  crew: CrewMember[];
  production_countries?: ProductionCountry[];
  production_companies?: ProductionCompany[];
  genres?: Genre[];
  runtime?: number;
  status?: string;
  created_by?: CrewMember[];
  origin_country?: string[];
  episode_run_time?: number[];
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  currentPage?: number;
  totalItems?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface MetadataInfo {
  fromCache: boolean;
  totalCastItems?: number;
  totalCrewItems?: number;
  cacheInfo?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationData;
  error?: string;
  meta?: MetadataInfo;
}
