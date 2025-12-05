import { Movie, FrontendMovie } from "@/types/movie";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  TMDB_BACKDROP_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";
import { TMDB_ENGLISH_GENRE_MAP } from "@/utils/genreMapping";

interface MovieInput {
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
  posterUrl?: string; // from backend API
  backdropPath?: string | null;
  backdrop_path?: string | null; // snake_case from TMDB API
  backdropUrl?: string; // from backend API
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

export function mapMovieToFrontend(movie: MovieInput): FrontendMovie {
  // TMDB ID is REQUIRED since all data comes from TMDB
  // Use tmdbId if available, fallback to id (which is also TMDB ID from API)
  const tmdbId = movie.tmdbId || movie.id;

  // Validate that we have a valid ID (convert to number if it's a string)
  const finalTmdbId = typeof tmdbId === "string" ? parseInt(tmdbId) : tmdbId;

  if (!finalTmdbId || finalTmdbId <= 0) {
    console.error("Missing or invalid tmdbId for movie:", movie);
    console.error(
      "tmdbId:",
      movie.tmdbId,
      "id:",
      movie.id,
      "final:",
      finalTmdbId
    );
    throw new Error(
      `Movie data is missing valid tmdbId/id. This should never happen since all data comes from TMDB.`
    );
  }

  // Handle both snake_case (from TMDB API) and camelCase (from backend)
  const posterPath = movie.posterPath || movie.poster_path;
  const backdropPath = movie.backdropPath || movie.backdrop_path;
  // Note: Don't fallback to first_air_date here - we need to detect content type first
  const releaseDate = movie.releaseDate || movie.release_date;
  const firstAirDate = movie.firstAirDate || movie.first_air_date;
  const voteAverage = movie.voteAverage || movie.vote_average;
  const genreIds = movie.genreIds || movie.genre_ids;

  // Handle title and original title for both movies and TV series
  const title = movie.title || movie.name || "Untitled";
  const originalTitle =
    movie.original_title ||
    movie.originalTitle ||
    movie.original_name ||
    movie.originalName ||
    title;

  // Backend already has full URLs - use them directly, otherwise construct from paths
  const posterUrl =
    movie.posterUrl ||
    (posterPath
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${posterPath}`
      : FALLBACK_POSTER);

  const backdropUrl =
    movie.backdropUrl ||
    (backdropPath
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_BACKDROP_SIZE}${backdropPath}`
      : FALLBACK_POSTER);

  // Map genres from IDs to English names (convert strings to numbers)
  const genres = genreIds
    ? genreIds
        .map((id: string | number) => TMDB_ENGLISH_GENRE_MAP[Number(id)])
        .filter(Boolean)
    : [];

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "Uncategorized";

  // Format rating
  const rating = voteAverage ? Math.round(voteAverage * 10) / 10 : 0;

  // Detect content type: TV series if has firstAirDate or media_type is "tv"
  const mediaType = movie.media_type || movie.mediaType;
  const hasFirstAirDate = !!firstAirDate;
  const hasReleaseDate = !!releaseDate;

  // It's a TV series if:
  // 1. Explicitly marked as "tv" via media_type/mediaType, OR
  // 2. Has firstAirDate but no releaseDate (TV series use firstAirDate)
  const isTVSeries =
    mediaType === "tv" ||
    (hasFirstAirDate && !hasReleaseDate);

  const contentTypePrefix = isTVSeries ? "tv" : "movie";
  const href = `/${contentTypePrefix}/${finalTmdbId}`;
  const watchHref = `/watch/${contentTypePrefix}-${finalTmdbId}`;

  // Use appropriate date field based on content type
  const displayDate = isTVSeries ? firstAirDate : releaseDate;

  // Format release year from appropriate date field
  const year = displayDate
    ? new Date(displayDate).getFullYear()
    : new Date().getFullYear();

  // Debug log to help diagnose issues
  if (process.env.NODE_ENV === 'development') {
    console.log(`[movieMapper] ${title}:`, {
      tmdbId: finalTmdbId,
      mediaType,
      hasFirstAirDate,
      hasReleaseDate,
      isTVSeries,
      href,
      contentTypePrefix,
      raw: {
        firstAirDate: movie.firstAirDate,
        first_air_date: movie.first_air_date,
        releaseDate: movie.releaseDate,
        release_date: movie.release_date
      }
    });
  }

  return {
    id: finalTmdbId.toString(),
    tmdbId: finalTmdbId,
    title: title,
    aliasTitle: originalTitle !== title ? originalTitle : title,
    poster: posterUrl,
    href,
    watchHref,
    year,
    rating,
    genre: primaryGenre,
    genres,
    description: movie.overview || "",
    backgroundImage: backdropUrl,
    posterImage: posterUrl,
    // Default values for fields not in backend
    duration: "N/A",
    season: undefined,
    episode: undefined,
    scenes: [], // You might want to add this to backend later
    isComplete: true, // Default to true, can be customized based on movie type
  };
}

export function mapMoviesToFrontend(movies: Movie[]): FrontendMovie[] {
  return movies.map((movie) =>
    mapMovieToFrontend(movie as unknown as MovieInput)
  );
}
