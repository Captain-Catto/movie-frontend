import { TVSeries, FrontendTVSeries } from "@/types/movie";
import { TMDB_TV_GENRE_MAP } from "@/utils/genresFetch";

// TMDB poster and backdrop base URLs
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";

export function mapTVSeriesToFrontend(series: any): FrontendTVSeries {
  // Backend already has full URLs - use them directly
  const posterUrl =
    series.posterUrl || series.posterPath
      ? series.posterUrl ||
        `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZE}${series.posterPath}`
      : "/images/no-poster.svg";

  const backdropUrl =
    series.backdropUrl || series.backdropPath
      ? series.backdropUrl ||
        `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZE}${series.backdropPath}`
      : "/images/no-poster.svg";

  // Map genres from IDs to English names (convert strings to numbers)
  const genres = series.genreIds
    .map((id: string | number) => TMDB_TV_GENRE_MAP[Number(id)])
    .filter(Boolean);

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "TV Series";

  // Format release year
  const year = series.firstAirDate
    ? new Date(series.firstAirDate).getFullYear()
    : new Date().getFullYear();

  // Format rating
  const rating = Math.round(series.voteAverage * 10) / 10;

  return {
    id: series.id.toString(),
    title: series.name || series.title,
    aliasTitle: series.originalName || series.originalTitle || series.name,
    poster: posterUrl,
    href: `/tv/${series.tmdbId || series.id}`,
    year,
    genre: primaryGenre,
    rating,
    genres,
    description: series.overview,
    backgroundImage: backdropUrl,
    posterImage: posterUrl,
    episodeNumber: series.numberOfEpisodes,
    totalEpisodes: series.numberOfEpisodes,
    isComplete: series.status === "Ended" || !series.inProduction,
    numberOfSeasons: series.numberOfSeasons || 1,
    duration: series.episodeRunTime?.[0]
      ? `${series.episodeRunTime[0]}m/ep`
      : "N/A",
    // Default values for fields not in backend
    scenes: [], // You might want to add this to backend later
  };
}

export function mapTVSeriesToFrontendList(
  tvSeries: TVSeries[]
): FrontendTVSeries[] {
  return tvSeries.map(mapTVSeriesToFrontend);
}
