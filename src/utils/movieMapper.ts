import { Movie, FrontendMovie } from "@/types/movie";
import { TMDB_GENRE_MAP } from "@/utils/genresFetch";

// TMDB poster and backdrop base URLs
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";

interface MovieInput {
  id?: number;
  tmdbId?: number;
  title?: string;
  original_title?: string; // snake_case from TMDB API
  originalTitle?: string; // camelCase from backend
  name?: string; // for TV series
  original_name?: string; // for TV series snake_case
  originalName?: string; // for TV series camelCase
  overview?: string;
  posterPath?: string | null;
  poster_path?: string | null; // snake_case from TMDB API
  posterUrl?: string;
  backdropPath?: string | null;
  backdrop_path?: string | null; // snake_case from TMDB API
  backdropUrl?: string;
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

  // Backend already has full URLs - use them directly
  const posterUrl =
    movie.posterUrl || posterPath
      ? movie.posterUrl || `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZE}${posterPath}`
      : "/images/no-poster.svg";

  const backdropUrl =
    movie.backdropUrl || backdropPath
      ? movie.backdropUrl ||
        `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZE}${backdropPath}`
      : "/images/no-poster.svg";

  // Map genres from IDs to Vietnamese names (convert strings to numbers)
  const genres = genreIds
    ? genreIds
        .map((id: string | number) => TMDB_GENRE_MAP[Number(id)])
        .filter(Boolean)
    : [];

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "Chưa phân loại";

  // Format release year
  const year = releaseDate
    ? new Date(releaseDate).getFullYear()
    : new Date().getFullYear();

  // Format rating
  const rating = voteAverage ? Math.round(voteAverage * 10) / 10 : 0;

  const href = `/movie/${movie.tmdbId || movie.id}`;

  return {
    id: (movie.id || movie.tmdbId || "0").toString(),
    title: title,
    aliasTitle: originalTitle !== title ? originalTitle : title,
    poster: posterUrl,
    href,
    year,
    genre: primaryGenre,
    rating,
    genres,
    description: movie.overview || "",
    backgroundImage: backdropUrl,
    posterImage: posterUrl,
    // Default values for fields not in backend
    duration: "N/A",
    season: undefined,
    episode: undefined,
    scenes: [], // You might want to add this to backend later
  };
}

export function mapMoviesToFrontend(movies: Movie[]): FrontendMovie[] {
  return movies.map((movie) =>
    mapMovieToFrontend(movie as unknown as MovieInput)
  );
}
