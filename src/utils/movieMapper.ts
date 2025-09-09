import { Movie, FrontendMovie } from "@/types/movie";

// TMDB poster and backdrop base URLs
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";

// TMDB Genre mapping to English names
const TMDB_ENGLISH_GENRE_MAP: Record<number, string> = {
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
  first_air_date?: string | null; // for TV series
  voteAverage?: number;
  vote_average?: number; // snake_case from TMDB API
  genreIds?: (string | number)[] | null;
  genre_ids?: (string | number)[] | null; // snake_case from TMDB API
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
  const releaseDate =
    movie.releaseDate || movie.release_date || movie.first_air_date;
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
      ? `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZE}${posterPath}`
      : "/images/no-poster.svg");

  const backdropUrl =
    movie.backdropUrl ||
    (backdropPath
      ? `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZE}${backdropPath}`
      : "/images/no-poster.svg");

  // Map genres from IDs to English names (convert strings to numbers)
  const genres = genreIds
    ? genreIds
        .map((id: string | number) => TMDB_ENGLISH_GENRE_MAP[Number(id)])
        .filter(Boolean)
    : [];

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "Uncategorized";

  // Format release year
  const year = releaseDate
    ? new Date(releaseDate).getFullYear()
    : new Date().getFullYear();

  // Format rating
  const rating = voteAverage ? Math.round(voteAverage * 10) / 10 : 0;

  const href = `/movie/${tmdbId}`;
  const watchHref = `/watch/movie-${tmdbId}`;

  return {
    id: movie.id.toString(),
    tmdbId: tmdbId,
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
