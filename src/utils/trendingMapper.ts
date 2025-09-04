import { FrontendMovie } from "@/types/movie";
import { TMDB_GENRE_MAP } from "@/utils/genresFetch";

// TMDB poster and backdrop base URLs
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";

export function mapTrendingToFrontend(trending: any): FrontendMovie {
  // Use the full URLs from backend if available
  const posterUrl = trending.posterUrl || "/images/no-poster.svg";
  const backdropUrl = trending.backdropUrl || "/images/no-poster.svg";

  // Map genres from IDs to Vietnamese names
  const genres = trending.genreIds
    .map((id: string | number) => TMDB_GENRE_MAP[Number(id)])
    .filter(Boolean);

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "Chưa phân loại";

  // Format release year
  const year = trending.releaseDate
    ? new Date(trending.releaseDate).getFullYear()
    : new Date().getFullYear();

  // Format rating
  const rating = Math.round(trending.voteAverage * 10) / 10;

  const href = `/movie/${trending.tmdbId}`;

  return {
    id: trending.tmdbId.toString(),
    title: trending.title,
    aliasTitle: trending.title,
    poster: posterUrl,
    href,
    year,
    genre: primaryGenre,
    rating,
    genres,
    description: trending.overview,
    backgroundImage: backdropUrl,
    posterImage: posterUrl,
    // Default values for fields not in backend trending data
    duration: trending.mediaType === "movie" ? "N/A" : "N/A",
    season: trending.mediaType === "tv" ? "Phần 1" : undefined,
    episode: trending.mediaType === "tv" ? "Nhiều Tập" : undefined,
    scenes: [], // Trending doesn't have scene data
  };
}

export function mapTrendingDataToFrontend(trendingItems: any[]): FrontendMovie[] {
  return trendingItems
    .sort((a, b) => b.popularity - a.popularity) // Sort by popularity descending
    .map(mapTrendingToFrontend);
}