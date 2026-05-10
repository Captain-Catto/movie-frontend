import { Movie, FrontendMovie, MovieInput } from "@/types/content.types";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  TMDB_BACKDROP_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";
import { TMDB_ENGLISH_GENRE_MAP } from "@/utils/genreMapping";
import { detectContentType } from "@/utils/contentType";
import { normalizeTmdbImageUrl } from "@/utils/tmdbImage";

export function mapMovieToFrontend(movie: MovieInput, language?: string): FrontendMovie {
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
  const originalLanguage =
    (movie as Record<string, unknown>).originalLanguage as string | null | undefined ??
    (movie as Record<string, unknown>).original_language as string | null | undefined;
  const originalTitle =
    movie.original_title ||
    movie.originalTitle ||
    movie.original_name ||
    movie.originalName ||
    movie.title ||
    movie.name ||
    "Untitled";
  // When browsing in Vietnamese and the movie's original language is Vietnamese,
  // prefer original_title since TMDB often lacks vi-VN translations and falls back to English.
  const isVietnamese = language?.startsWith("vi");
  const title =
    isVietnamese && originalLanguage === "vi" && originalTitle
      ? originalTitle
      : movie.title || movie.name || originalTitle;

  // Backend already has full URLs - use them directly, otherwise construct from paths
  const posterUrl =
    normalizeTmdbImageUrl(movie.posterUrl, TMDB_POSTER_SIZE) ||
    (posterPath
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${posterPath}`
      : FALLBACK_POSTER);

  const backdropUrl =
    normalizeTmdbImageUrl(movie.backdropUrl, TMDB_BACKDROP_SIZE) ||
    (backdropPath
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_BACKDROP_SIZE}${backdropPath}`
      : FALLBACK_POSTER);

  // Map genres from IDs to English names (convert strings to numbers)
  const normalizedGenreIds = genreIds
    ? genreIds
        .map((id: string | number) => Number(id))
        .filter((id) => !Number.isNaN(id))
    : [];

  const genres = normalizedGenreIds
    .map((id: number) => TMDB_ENGLISH_GENRE_MAP[id])
    .filter(Boolean);

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "Uncategorized";

  // Format rating
  const rating = voteAverage ? Math.round(voteAverage * 10) / 10 : 0;

  const contentType = detectContentType(movie as Record<string, unknown>);
  const isTVSeries = contentType === "tv";

  const contentTypePrefix = isTVSeries ? "tv" : "movie";
  const href = `/${contentTypePrefix}/${finalTmdbId}`;
  const watchHref = `/watch/${contentTypePrefix}-${finalTmdbId}`;

  // Use appropriate date field based on content type
  const displayDate = isTVSeries ? firstAirDate : releaseDate;

  // Format release year from appropriate date field
  const year = displayDate
    ? new Date(displayDate).getFullYear()
    : new Date().getFullYear();

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
    genreIds: normalizedGenreIds,
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

export function mapMoviesToFrontend(movies: Movie[], language?: string): FrontendMovie[] {
  return movies.map((movie) =>
    mapMovieToFrontend(movie as unknown as MovieInput, language)
  );
}
