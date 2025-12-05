import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  TMDB_BACKDROP_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";
import { TMDB_TV_GENRE_MAP as TMDB_TV_ENGLISH_GENRE_MAP } from "@/utils/genreMapping";
import { TVSeries, FrontendTVSeries } from "@/types/movie";

export function mapTVSeriesToFrontend(
  series: Record<string, unknown>
): FrontendTVSeries {
  const ensureString = (value: unknown): string | undefined =>
    typeof value === "string" && value.length > 0 ? value : undefined;

  const ensureNumber = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  const ensureNumberArray = (value: unknown): number[] =>
    Array.isArray(value)
      ? value
          .map((item) => {
            if (typeof item === "number") return item;
            if (typeof item === "string") {
              const parsed = Number(item);
              return Number.isNaN(parsed) ? null : parsed;
            }
            return null;
          })
          .filter((item): item is number => item !== null)
      : [];

  const tmdbId =
    ensureNumber(series.tmdbId) ?? ensureNumber(series.id) ?? NaN;

  if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
    throw new Error("TV series data is missing a valid tmdbId/id");
  }

  const idValue =
    typeof series.id === "number" || typeof series.id === "string"
      ? series.id.toString()
      : tmdbId.toString();

  const title =
    ensureString(series.name) ?? ensureString(series.title) ?? "Unknown";

  const aliasTitle =
    ensureString(series.originalName) ??
    ensureString(series.originalTitle) ??
    title;

  const posterPath = ensureString(series.posterUrl);
  const poster =
    posterPath ||
    (ensureString(series.poster_path)
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${series.poster_path}`
      : FALLBACK_POSTER);

  const backdropPath = ensureString(series.backdropUrl);
  const backdrop =
    backdropPath ||
    (ensureString(series.backdrop_path)
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_BACKDROP_SIZE}${series.backdrop_path}`
      : FALLBACK_POSTER);

  const firstAirDate =
    ensureString(series.firstAirDate) ?? ensureString(series.first_air_date);
  const year = firstAirDate
    ? new Date(firstAirDate).getFullYear() || new Date().getFullYear()
    : new Date().getFullYear();

  const ratingValue =
    ensureNumber(series.voteAverage) ?? ensureNumber(series.vote_average) ?? 0;
  const rating = Math.round(ratingValue * 10) / 10;

  const genreIds = ensureNumberArray(series.genreIds ?? series.genre_ids);
  const genres = genreIds
    .map((id) => TMDB_TV_ENGLISH_GENRE_MAP[id])
    .filter((genre): genre is string => Boolean(genre));
  const primaryGenre = genres[0] || "TV Series";

  const mediaType = ensureString(series.media_type) ?? "tv";
  const baseUrl = mediaType === "tv" ? "/tv" : "/movie";
  const itemHref = `${baseUrl}/${tmdbId}`;
  const watchUrl =
    mediaType === "tv" ? `/watch/tv-${tmdbId}` : `/watch/movie-${tmdbId}`;

  const episodeRunTimeArray = Array.isArray(series.episodeRunTime)
    ? series.episodeRunTime
    : Array.isArray(series.episode_run_time)
    ? series.episode_run_time
    : [];

  const duration =
    episodeRunTimeArray && episodeRunTimeArray.length > 0
      ? `${episodeRunTimeArray[0]}m/ep`
      : "N/A";

  const numberOfEpisodes =
    ensureNumber(series.numberOfEpisodes) ??
    ensureNumber(series.number_of_episodes);

  const numberOfSeasons =
    ensureNumber(series.numberOfSeasons) ??
    ensureNumber(series.number_of_seasons) ??
    1;

  const status = ensureString(series.status);
  const inProduction = Boolean(series.inProduction ?? series.in_production);

  return {
    id: idValue,
    tmdbId,
    title,
    aliasTitle,
    poster,
    href: itemHref,
    watchHref: watchUrl,
    year,
    rating,
    genre: primaryGenre,
    genres,
    description: ensureString(series.overview) ?? "",
    backgroundImage: backdrop,
    posterImage: poster,
    episodeNumber: numberOfEpisodes,
    totalEpisodes: numberOfEpisodes,
    isComplete: status === "Ended" || !inProduction,
    numberOfSeasons,
    duration,
    scenes: [],
  };
}

export function mapTVSeriesToFrontendList(
  tvSeries: TVSeries[]
): FrontendTVSeries[] {
  return tvSeries.map((series) =>
    mapTVSeriesToFrontend(series as unknown as Record<string, unknown>)
  );
}
