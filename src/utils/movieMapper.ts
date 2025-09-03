import { Movie, FrontendMovie } from "@/types/movie";
import { TMDB_GENRE_MAP } from "@/utils/genresFetch";

// TMDB poster and backdrop base URLs
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";

export function mapMovieToFrontend(movie: any): FrontendMovie {
  // Backend already has full URLs - use them directly
  const posterUrl =
    movie.posterUrl || movie.posterPath
      ? movie.posterUrl ||
        `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZE}${movie.posterPath}`
      : "/images/no-poster.svg";

  const backdropUrl =
    movie.backdropUrl || movie.backdropPath
      ? movie.backdropUrl ||
        `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZE}${movie.backdropPath}`
      : "/images/no-poster.svg";

  // Map genres from IDs to Vietnamese names (convert strings to numbers)
  const genres = movie.genreIds
    .map((id: string | number) => TMDB_GENRE_MAP[Number(id)])
    .filter(Boolean);

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "Chưa phân loại";

  // Format release year
  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : new Date().getFullYear();

  // Format rating
  const rating = Math.round(movie.voteAverage * 10) / 10;

  const href = `/movie/${movie.tmdbId || movie.id}`;

  return {
    id: movie.id.toString(),
    title: movie.title,
    aliasTitle: movie.title,
    poster: posterUrl,
    href,
    year,
    genre: primaryGenre,
    rating,
    genres,
    description: movie.overview,
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
  return movies.map(mapMovieToFrontend);
}
