// Utility for mapping content data in watch pages
// Handles both Movie and TV Series data structures

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

// TMDB Genre mapping to English names
const TMDB_ENGLISH_GENRE_MAP: Record<string | number, string> = {
  // Movie genres
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  // TV genres
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

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

  const duration = normalizeMovieDuration(movie);

  return {
    id: movieId,
    tmdbId: movie.tmdbId || movie.id || 0,
    title: movie.title || movie.name || "Untitled",
    aliasTitle:
      movie.originalTitle || movie.original_title || movie.original_name,
    description: movie.overview || "Không có mô tả",
    releaseDate: movie.releaseDate || movie.release_date || "",
    rating: Number(movie.voteAverage) || movie.vote_average || 0,
    duration,
    genres: mapGenreIds(movie.genreIds || movie.genre_ids || []),
    posterImage:
      movie.posterUrl ||
      (movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "/images/no-poster.svg"),
    backgroundImage:
      movie.backdropUrl ||
      (movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : "/images/no-poster.svg"),
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

  const duration = normalizeTVDuration(tv);

  return {
    id: movieId,
    tmdbId: tv.tmdbId || tv.id || 0,
    title: tv.title || tv.name || "Untitled",
    aliasTitle: tv.originalTitle || tv.original_title || tv.original_name,
    description: tv.overview || "Không có mô tả",
    releaseDate: tv.firstAirDate || tv.first_air_date || "",
    rating: parseFloat(String(tv.voteAverage)) || tv.vote_average || 0,
    duration,
    genres: mapGenreIds(tv.genreIds || tv.genre_ids || []),
    posterImage:
      tv.posterUrl ||
      (tv.poster_path
        ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
        : "/images/no-poster.svg"),
    backgroundImage:
      tv.backdropUrl ||
      (tv.backdrop_path
        ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}`
        : "/images/no-poster.svg"),
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
    .map((id: string | number) => TMDB_ENGLISH_GENRE_MAP[id])
    .filter(Boolean);
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
