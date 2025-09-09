import { TVSeries, FrontendTVSeries } from "@/types/movie";

// TMDB poster and backdrop base URLs
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const POSTER_SIZE = "w500";
const BACKDROP_SIZE = "w1280";

// TMDB TV Genre mapping to English names
const TMDB_TV_ENGLISH_GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

export function mapTVSeriesToFrontend(series: any): FrontendTVSeries {
  // Backend already has full URLs - use them directly
  const posterUrl =
    series.posterUrl || series.poster_path
      ? series.posterUrl ||
        `${TMDB_IMAGE_BASE_URL}/${POSTER_SIZE}${series.poster_path}`
      : "/images/no-poster.svg";

  const backdropUrl =
    series.backdropUrl || series.backdrop_path
      ? series.backdropUrl ||
        `${TMDB_IMAGE_BASE_URL}/${BACKDROP_SIZE}${series.backdrop_path}`
      : "/images/no-poster.svg";

  // Map genres from IDs to English names (convert strings to numbers)
  const genres = (series.genreIds || series.genre_ids || [])
    .map((id: string | number) => TMDB_TV_ENGLISH_GENRE_MAP[Number(id)])
    .filter(Boolean);

  // Get primary genre for the genre field
  const primaryGenre = genres[0] || "TV Series";

  // Format release year
  const year =
    series.firstAirDate || series.first_air_date
      ? new Date(series.firstAirDate || series.first_air_date).getFullYear()
      : new Date().getFullYear();

  // Format rating
  const rating =
    Math.round((series.voteAverage || series.vote_average || 0) * 10) / 10;

  // Determine correct URL based on media_type
  const baseUrl = series.media_type === "tv" ? "/tv" : "/movie";
  const itemHref = `${baseUrl}/${series.tmdbId || series.id}`;
  const watchUrl =
    series.media_type === "tv"
      ? `/watch/tv-${series.tmdbId || series.id}`
      : `/watch/movie-${series.tmdbId || series.id}`;

  return {
    id: series.id.toString(),
    tmdbId: series.tmdbId || series.id,
    title: series.name || series.title,
    aliasTitle: series.originalName || series.originalTitle || series.name,
    poster: posterUrl,
    href: itemHref, // Dynamic URL based on media type
    watchHref: watchUrl, // Dynamic watch URL based on media type
    year,
    rating,
    genre: primaryGenre,
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
