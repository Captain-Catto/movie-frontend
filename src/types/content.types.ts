// Content Types - Unified movie, TV series, and trending type definitions

import type { ApiResponse } from "./api";

// ===========================
// Common Types
// ===========================

export interface Genre {
  id: number;
  name: string;
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

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
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
  title?: string;
  original_title?: string;
  media_type?: "movie" | "tv";
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  [key: string]: unknown;
}

export interface Director {
  id: number;
  name: string;
}

// ===========================
// Video / Trailer
// ===========================

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

// ===========================
// Episode / Season
// ===========================

export interface Episode {
  id: number;
  episodeNumber: number;
  episodeType?: string | null;
  name: string;
  overview: string;
  airDate: string | null;
  productionCode?: string | null;
  runtime: number | null;
  seasonNumber: number;
  showId: number;
  stillPath: string | null;
  voteAverage: number;
  voteCount: number;
}

export interface Season {
  id?: number | string;
  airDate?: string | null;
  overview?: string;
  posterPath?: string | null;
  seasonNumber: number;
  voteAverage?: number;
  name: string;
  episodes: Episode[];
}

// ===========================
// Credits
// ===========================

export interface Credits {
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

// ===========================
// Domain Entities
// ===========================

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

export interface TrendingItem extends Movie {
  mediaType: "movie" | "tv" | string;
  thumbnailUrl?: string | null;
  isHidden?: boolean;
  hiddenReason?: string | null;
  hiddenAt?: string | null;
}

// ===========================
// Content Union & Type Guards
// ===========================

export type ContentType = "movie" | "tv";
export type Content = Movie | TVSeries;

export interface ContentIdentifier {
  id: number;
  tmdbId: number;
  type: ContentType;
}

export interface ContentMetadata {
  type: ContentType;
  isFavorite?: boolean;
  isWatched?: boolean;
  watchProgress?: number;
  lastWatchedAt?: string;
}

export function isMovie(content: Content): content is Movie {
  return "releaseDate" in content;
}

export function isTVSeries(content: Content): content is TVSeries {
  return "firstAirDate" in content;
}

export function getContentType(content: Content): ContentType {
  return isMovie(content) ? "movie" : "tv";
}

// ===========================
// Frontend Display Types
// ===========================

export interface FrontendMovie {
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
  mediaType?: "movie" | "tv";
}

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

export interface Category {
  id: string;
  name: string;
  backgroundImage: string;
}

// ===========================
// Detail Types
// ===========================

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

// ===========================
// Input Mapper (handles snake_case/camelCase from API)
// ===========================

export interface MovieInput {
  id?: number;
  tmdbId?: number;
  title?: string;
  original_title?: string;
  originalTitle?: string;
  name?: string;
  original_name?: string;
  originalName?: string;
  overview?: string;
  posterPath?: string | null;
  poster_path?: string | null;
  posterUrl?: string | null;
  backdropPath?: string | null;
  backdrop_path?: string | null;
  backdropUrl?: string | null;
  releaseDate?: string | Date | null;
  release_date?: string | null;
  first_air_date?: string | null;
  firstAirDate?: string | Date | null;
  voteAverage?: number;
  vote_average?: number;
  genreIds?: (string | number)[] | null;
  genre_ids?: (string | number)[] | null;
  media_type?: string;
  mediaType?: string;
  [key: string]: unknown;
}

// ===========================
// Query Parameters
// ===========================

export interface ContentQuery {
  page?: number;
  limit?: number;
  genre?: string;
  year?: number;
  language?: string;
  sortBy?: string;
  countries?: string;
}

// ===========================
// Stream / Lookup Types
// ===========================

export interface StreamData {
  provider: string;
  tmdbId: number;
  contentType: "movie" | "tv";
  url: string;
  fallbackUrls: string[];
}

export interface ContentLookup {
  internalId: number;
  tmdbId: number;
  contentType: "movie" | "tv";
  redirectUrl: string;
}

// ===========================
// Upload Types
// ===========================

export interface UploadedMovie {
  id: string;
  title: string;
  description: string;
  year: number;
  genre: string;
  duration: string;
  s3Key: string;
  streamUrl: string;
  posterUrl?: string;
  uploadDate: string;
  fileSize: number;
  originalName: string;
}

// ===========================
// API Response Aliases
// ===========================

export type MovieListResponse = ApiResponse<Movie[]>;
export type TVSeriesListResponse = ApiResponse<TVSeries[]>;
export type TrendingListResponse = ApiResponse<TrendingItem[]>;
export type CreditsResponse = ApiResponse<Credits>;

export interface ContentByIdResponse {
  content: Movie | TVSeries | null;
  contentType: ContentType;
  success: boolean;
  message?: string;
}
