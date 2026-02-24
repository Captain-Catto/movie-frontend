import { FrontendMovie } from "@/types/content.types";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import { TMDB_ENGLISH_GENRE_MAP } from "@/utils/genreMapping";
import { detectContentType } from "@/utils/contentType";

type TrendingItem = {
  tmdbId: number | string;
  title: string;
  overview?: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  genreIds?: (string | number)[] | null;
  releaseDate?: string | Date | null;
  voteAverage?: number;
  mediaType?: "movie" | "tv" | string;
  isHidden?: boolean;
  popularity?: number;
};

export function mapTrendingToFrontend(trending: TrendingItem): FrontendMovie {
  // Normalize TMDB id
  const tmdbIdRaw = trending.tmdbId;
  const tmdbId =
    typeof tmdbIdRaw === "string" ? parseInt(tmdbIdRaw, 10) : tmdbIdRaw;

  if (!tmdbId || Number.isNaN(tmdbId)) {
    throw new Error("Trending item missing valid tmdbId");
  }

  // Use the full URLs from backend if available
  const posterUrl = trending.posterUrl || FALLBACK_POSTER;
  const backdropUrl = trending.backdropUrl || FALLBACK_POSTER;

  const genreSource = Array.isArray(trending.genreIds)
    ? trending.genreIds
    : [];
  const genreIds = genreSource
    .map((id: string | number) => Number(id))
    .filter((id) => !Number.isNaN(id));

  // Map genres from IDs to English names
  const genres = genreIds.map((id: number) => TMDB_ENGLISH_GENRE_MAP[id]).filter(Boolean);

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "Uncategorized";

  // Format release year
  const year = trending.releaseDate
    ? new Date(trending.releaseDate).getFullYear()
    : new Date().getFullYear();

  // Format rating
  const ratingRaw =
    typeof trending.voteAverage === "string"
      ? parseFloat(trending.voteAverage)
      : trending.voteAverage;
  const rating =
    typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
      ? Math.round(ratingRaw * 10) / 10
      : 0;

  const mediaType = detectContentType(trending as Record<string, unknown>);
  const href = mediaType === "tv" ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;

  return {
    id: tmdbId.toString(),
    tmdbId,
    title: trending.title,
    aliasTitle: trending.title,
    poster: posterUrl,
    href,
    year,
    genre: primaryGenre,
    genreIds,
    rating,
    genres,
    description: trending.overview,
    backgroundImage: backdropUrl,
    posterImage: posterUrl,
    mediaType, // ✅ Include normalized mediaType for favorites
    // Default values for fields not in backend trending data
    duration: trending.mediaType === "movie" ? "N/A" : "N/A",
    season: trending.mediaType === "tv" ? "Season 1" : undefined,
    episode: trending.mediaType === "tv" ? "Multiple Episodes" : undefined,
    scenes: [], // Trending doesn't have scene data
  };
}

export function mapTrendingDataToFrontend(
  trendingItems: TrendingItem[]
): FrontendMovie[] {
  return trendingItems
    .filter((item) => !item.isHidden)
    .sort((a, b) => {
      const popA = a.popularity || 0;
      const popB = b.popularity || 0;
      return popB - popA;
    })
    .map(mapTrendingToFrontend);
}
