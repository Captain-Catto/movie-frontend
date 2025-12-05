// Utility for mapping content data in watch pages
// Handles both Movie and TV Series data structures
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  TMDB_ORIGINAL_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";
import { TMDB_ENGLISH_GENRE_MAP } from "@/utils/genreMapping";
import { normalizeRatingFromSource } from "./rating";

// Base API response structure
interface APIResponse {
  success: boolean;
  message: string;
  data?: unknown;
  content?: unknown;
  contentType?: "movie" | "tv";
}

// Input data structure from backend
interface ContentInput {
  id?: number;
  tmdbId?: number;
  title?: string;
  name?: string;
  originalTitle?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  releaseDate?: string;
  release_date?: string;
  firstAirDate?: string;
  first_air_date?: string;
  voteAverage?: number | string;
  vote_average?: number;
  runtime?: number | string;
  duration?: number | string;
  genreIds?: (string | number)[];
  genre_ids?: (string | number)[];
  posterUrl?: string;
  poster_path?: string;
  backdropUrl?: string;
  backdrop_path?: string;
  // TV-specific fields
  numberOfSeasons?: number;
  number_of_seasons?: number;
  numberOfEpisodes?: number;
  number_of_episodes?: number;
  episodeRunTime?: number[];
  episode_run_time?: number[];
  status?: string;
  type?: string;
  created_by?: Array<{
    id: number;
    name: string;
    profile_path?: string;
  }>;
  [key: string]: unknown;
}

export interface WatchContentData {
  id: string;
  tmdbId: number;
  title: string;
  aliasTitle?: string;
  description: string;
  releaseDate: string;
  rating: number;
  duration?: number;
  genres: string[];
  posterImage: string;
  backgroundImage: string;
  year: number;
  contentType: "movie" | "tv";
  // TV-specific fields
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  status?: string;
  type?: string;
  created_by?: Array<{
    id: number;
    name: string;
    profile_path?: string;
  }>;
}

/**
 * Maps movie data from backend API response to WatchContentData format
 */
export function mapMovieToWatchContent(
  movieResponse: APIResponse | ContentInput,
  movieId: string
): WatchContentData {
  const movie =
    ((movieResponse as APIResponse).data as ContentInput) ||
    ((movieResponse as APIResponse).content as ContentInput) ||
    (movieResponse as ContentInput);

  const rating = normalizeRating(
    movie.voteAverage ?? movie.vote_average,
    movie
  );
  const duration = normalizeMovieDuration(movie);

  return {
    id: movieId,
    tmdbId: movie.tmdbId || movie.id || 0,
    title: movie.title || movie.name || "Untitled",
    aliasTitle:
      movie.originalTitle || movie.original_title || movie.original_name,
    description: movie.overview || "Không có mô tả",
    releaseDate: movie.releaseDate || movie.release_date || "",
    rating,
    duration,
    genres: mapGenreIds(movie.genreIds || movie.genre_ids || []),
    posterImage:
      movie.posterUrl ||
      (movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${movie.poster_path}`
        : FALLBACK_POSTER),
    backgroundImage:
      movie.backdropUrl ||
      (movie.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}/${TMDB_ORIGINAL_SIZE}${movie.backdrop_path}`
        : FALLBACK_POSTER),
    year: getYear(movie.releaseDate || movie.release_date),
    contentType: "movie",
  };
}

/**
 * Maps TV series data from backend API response to WatchContentData format
 */
export function mapTVToWatchContent(
  tvResponse: APIResponse | ContentInput,
  movieId: string
): WatchContentData {
  const tv =
    ((tvResponse as APIResponse).data as ContentInput) ||
    ((tvResponse as APIResponse).content as ContentInput) ||
    (tvResponse as ContentInput);

  const rating = normalizeRating(
    tv.voteAverage ?? tv.vote_average,
    tv
  );
  const duration = normalizeTVDuration(tv);

  return {
    id: movieId,
    tmdbId: tv.tmdbId || tv.id || 0,
    title: tv.title || tv.name || "Untitled",
    aliasTitle: tv.originalTitle || tv.original_title || tv.original_name,
    description: tv.overview || "Không có mô tả",
    releaseDate: tv.firstAirDate || tv.first_air_date || "",
    rating,
    duration,
    genres: mapGenreIds(tv.genreIds || tv.genre_ids || []),
    posterImage:
      tv.posterUrl ||
      (tv.poster_path
        ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${tv.poster_path}`
        : FALLBACK_POSTER),
    backgroundImage:
      tv.backdropUrl ||
      (tv.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}/${TMDB_ORIGINAL_SIZE}${tv.backdrop_path}`
        : FALLBACK_POSTER),
    year: getYear(tv.firstAirDate || tv.first_air_date),
    contentType: "tv",
    numberOfSeasons: tv.numberOfSeasons || tv.number_of_seasons,
    numberOfEpisodes: tv.numberOfEpisodes || tv.number_of_episodes,
    status: tv.status,
    type: tv.type,
    created_by: tv.created_by,
  };
}

/**
 * Auto-detects content type and maps accordingly
 */
export function mapContentToWatchContent(
  response: APIResponse | ContentInput,
  movieId: string
): WatchContentData {
  const content =
    ((response as APIResponse).data as ContentInput) ||
    ((response as APIResponse).content as ContentInput) ||
    (response as ContentInput);

  // Detect if it's TV or Movie based on available fields
  const isTVSeries = !!(
    content.firstAirDate ||
    content.first_air_date ||
    content.numberOfSeasons ||
    content.number_of_seasons ||
    content.numberOfEpisodes ||
    content.number_of_episodes ||
    content.created_by ||
    (response as APIResponse).contentType === "tv"
  );

  if (isTVSeries) {
    return mapTVToWatchContent(response, movieId);
  } else {
    return mapMovieToWatchContent(response, movieId);
  }
}

/**
 * Helper function to map genre IDs to genre names
 */
function mapGenreIds(genreIds: (string | number)[]): string[] {
  if (!genreIds || !Array.isArray(genreIds)) return [];

  return genreIds
    .map((id: string | number) => TMDB_ENGLISH_GENRE_MAP[Number(id)])
    .filter(Boolean);
}

/**
 * Normalize rating from various possible fields using shared helper.
 */
function normalizeRating(
  primary: unknown,
  source: ContentInput
): number {
  return normalizeRatingFromSource(primary, source as Record<string, unknown>);
}

/**
 * Normalize a duration-ish field to a positive number of minutes.
 */
function coerceDuration(raw?: unknown): number | undefined {
  const num = Number(raw);
  if (Number.isFinite(num) && num > 0) return num;
  return undefined;
}

function normalizeMovieDuration(movie: ContentInput): number | undefined {
  const candidates = [
    movie.runtime,
    movie.duration,
    (movie as { runtimeMinutes?: number | string }).runtimeMinutes,
    (movie as { runtime_minutes?: number | string }).runtime_minutes,
    (movie as { runtime_in_minutes?: number | string }).runtime_in_minutes,
  ];

  for (const value of candidates) {
    const parsed = coerceDuration(value);
    if (parsed !== undefined) return parsed;
  }

  return undefined;
}

function normalizeTVDuration(tv: ContentInput): number | undefined {
  const episodeRuntime =
    tv.episodeRunTime?.[0] ||
    (tv.episode_run_time && tv.episode_run_time[0]);

  const candidates = [
    episodeRuntime,
    tv.runtime,
    tv.duration,
    (tv as { runtimeMinutes?: number | string }).runtimeMinutes,
    (tv as { runtime_minutes?: number | string }).runtime_minutes,
  ];

  for (const value of candidates) {
    const parsed = coerceDuration(value);
    if (parsed !== undefined) return parsed;
  }

  return undefined;
}

/**
 * Helper function to extract year from date string
 */
function getYear(dateString?: string | null): number {
  if (!dateString) return new Date().getFullYear();

  const year = new Date(dateString).getFullYear();
  return isNaN(year) ? new Date().getFullYear() : year;
}

/**
 * Helper function to format duration for display
 */
export function formatWatchDuration(
  minutes?: number,
  contentType?: "movie" | "tv"
): string {
  if (!minutes) return "";

  if (contentType === "tv") {
    return `${minutes}m/ep`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
