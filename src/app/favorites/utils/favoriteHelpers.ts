import { ProcessedFavorite } from "@/services/favorites.service";
import { MovieCardData } from "@/components/movie/MovieCard";

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
      ? `https://image.tmdb.org/t/p/w500${favorite.poster_path}`
      : "/images/no-poster.svg",
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
