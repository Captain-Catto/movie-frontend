import { ProcessedFavorite } from "@/services/favorites.service";
import { MovieCardData } from "@/components/movie/MovieCard";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";

/**
 * Convert ProcessedFavorite data to MovieCardData format for use with MovieCard component
 */
export const favoriteToMovieCardData = (
  favorite: ProcessedFavorite
): MovieCardData => {
  return {
    id: favorite.id.toString(),
    tmdbId: favorite.id,
    title: favorite.title || favorite.name || "",
    aliasTitle: favorite.title || favorite.name || "", // Use same title as alias if no alias available
    poster: favorite.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${favorite.poster_path}`
      : FALLBACK_POSTER,
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
    description: favorite.overview,
  };
};
