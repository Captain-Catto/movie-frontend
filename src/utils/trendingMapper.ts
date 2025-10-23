import { FrontendMovie } from "@/types/movie";

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

export function mapTrendingToFrontend(trending: any): FrontendMovie {
  // Use the full URLs from backend if available
  const posterUrl = trending.posterUrl || "/images/no-poster.svg";
  const backdropUrl = trending.backdropUrl || "/images/no-poster.svg";

  const genreSource = Array.isArray(trending.genreIds)
    ? trending.genreIds
    : [];

  // Map genres from IDs to English names
  const genres = genreSource
    .map((id: string | number) => TMDB_ENGLISH_GENRE_MAP[Number(id)])
    .filter(Boolean);

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "Uncategorized";

  // Format release year
  const year = trending.releaseDate
    ? new Date(trending.releaseDate).getFullYear()
    : new Date().getFullYear();

  // Format rating
  const rating =
    typeof trending.voteAverage === "number"
      ? Math.round(trending.voteAverage * 10) / 10
      : 0;

  // Create correct href based on media_type
  const href =
    trending.mediaType === "tv"
      ? `/tv/${trending.tmdbId}`
      : `/movie/${trending.tmdbId}`;

  return {
    id: trending.tmdbId.toString(),
    tmdbId: trending.tmdbId,
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
    mediaType: trending.mediaType, // ✅ Include mediaType for favorites
    // Default values for fields not in backend trending data
    duration: trending.mediaType === "movie" ? "N/A" : "N/A",
    season: trending.mediaType === "tv" ? "Season 1" : undefined,
    episode: trending.mediaType === "tv" ? "Multiple Episodes" : undefined,
    scenes: [], // Trending doesn't have scene data
  };
}

export function mapTrendingDataToFrontend(
  trendingItems: any[]
): FrontendMovie[] {
  return trendingItems
    .filter((item) => !item.isHidden)
    .sort((a, b) => b.popularity - a.popularity) // Sort by popularity descending
    .map(mapTrendingToFrontend);
}
