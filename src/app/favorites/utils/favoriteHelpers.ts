import { ProcessedFavorite } from "@/services/favorites.service";
import { MovieCardData } from "@/components/movie/MovieCard";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
  TMDB_BACKDROP_SIZE,
} from "@/constants/app.constants";

/**
 * Convert ProcessedFavorite data to MovieCardData format for use with MovieCard component
 */
export const favoriteToMovieCardData = (
  favorite: ProcessedFavorite
): MovieCardData => {
  const posterPath = favorite.poster_path || favorite.backdrop_path || null;
  const posterUrl = posterPath
    ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${posterPath}`
    : FALLBACK_POSTER;

  return {
    id: favorite.id.toString(),
    tmdbId: favorite.id,
    title: favorite.title || favorite.name || "",
    aliasTitle: favorite.title || favorite.name || "", // Use same title as alias if no alias available
    poster: posterUrl,
    posterImage: posterUrl,
    backgroundImage: favorite.backdrop_path
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_BACKDROP_SIZE}${favorite.backdrop_path}`
      : posterUrl,
    href:
      favorite.media_type === "tv"
        ? `/tv/${favorite.id}`
        : `/movie/${favorite.id}`,
    year: favorite.release_date
      ? new Date(favorite.release_date).getFullYear()
      : favorite.first_air_date
      ? new Date(favorite.first_air_date).getFullYear()
      : undefined,
    rating: favorite.vote_average,
    genres: favorite.genres || [],
    genreIds: favorite.genre_ids || [],
    description: favorite.overview,
  };
};
