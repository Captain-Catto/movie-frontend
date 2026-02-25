import { apiService } from "@/services/api";
import { normalizeRatingValue } from "@/utils/rating";
import { getLocalizedGenreNameById } from "@/utils/genreMapping";
import {
  formatWatchDuration,
  mapContentToWatchContent,
} from "@/utils/watchContentMapper";
import { FALLBACK_POSTER, getDsLanguageFromLanguage } from "@/constants/app.constants";
import type {
  MovieDetailPageDataResult,
  TVDetailPageDataResult,
  WatchPageCredits,
  WatchPageDataResult,
  WatchPageRecommendationItem,
} from "@/lib/page-data.types";
import type {
  MovieDetail,
  TVDetail,
  Movie,
  TVSeries,
  Credits,
  CastMember,
  CrewMember,
  ContentType,
} from "@/types/content.types";

interface ContentLookupResult {
  content: Movie | TVSeries | null;
  contentType: "movie" | "tv";
  success: boolean;
  message?: string;
}

async function lookupContentByTmdbId(
  tmdbId: number,
  language: string
): Promise<ContentLookupResult> {
  const lookupResult = await apiService.lookupByTmdbId(tmdbId);

  if (lookupResult.success && lookupResult.data?.contentType === "tv") {
    return apiService.getTVByTmdbId(tmdbId, language);
  }
  if (lookupResult.success && lookupResult.data?.contentType === "movie") {
    return apiService.getMovieByTmdbId(tmdbId, language);
  }

  return apiService.getContentById(tmdbId, language);
}

function mapMovieToDetail(content: Movie, language: string): MovieDetail {
  const genreNames =
    content.genreIds
      ?.map((id) => getLocalizedGenreNameById(id, language, "movie"))
      .filter((name): name is string => Boolean(name)) || [];

  const runtime = (content as { runtime?: number }).runtime;
  const runtimeText =
    typeof runtime === "number"
      ? formatWatchDuration(Number(runtime), "movie")
      : "N/A";

  return {
    id: content.id,
    tmdbId: content.tmdbId,
    title: content.title,
    aliasTitle:
      content.defaultTitle && content.defaultTitle !== content.title
        ? content.defaultTitle
        : "",
    rating: normalizeRatingValue(
      content.voteAverage ??
        (content as { vote_average?: number | string }).vote_average ??
        (content as unknown as Record<string, unknown>).rating
    ),
    year: content.releaseDate
      ? new Date(content.releaseDate).getFullYear()
      : new Date().getFullYear(),
    runtime: runtimeText,
    genres: genreNames,
    genreIds: content.genreIds || [],
    description: content.overview || "No description available",
    backgroundImage: content.backdropUrl || content.backdropPath || FALLBACK_POSTER,
    posterImage: content.posterUrl || content.posterPath || FALLBACK_POSTER,
    director: null,
    cast: [],
    country: "Loading...",
    status: "Released",
    quality: "HD",
    language:
      content.originalLanguage === "vi"
        ? "Vietsub"
        : content.originalLanguage?.toUpperCase() || "",
    contentType: "movie",
    voteCount: content.voteCount,
    popularity: content.popularity,
    scenes: [],
  };
}

function mapTVToMovieDetail(content: TVSeries, language: string): MovieDetail {
  const genreNames =
    content.genreIds
      ?.map((id) => getLocalizedGenreNameById(id, language, "tv"))
      .filter((name): name is string => Boolean(name)) || [];

  return {
    id: content.id,
    tmdbId: content.tmdbId,
    title: content.title || content.originalTitle || "Untitled",
    aliasTitle: content.originalTitle || content.title || "Untitled",
    rating: normalizeRatingValue(
      content.voteAverage ??
        (content as { vote_average?: number | string }).vote_average ??
        (content as unknown as Record<string, unknown>).rating
    ),
    year: content.firstAirDate
      ? new Date(content.firstAirDate).getFullYear()
      : new Date().getFullYear(),
    runtime: content.episodeRunTime?.length
      ? formatWatchDuration(content.episodeRunTime[0], "tv")
      : "N/A",
    genres: genreNames,
    genreIds: content.genreIds || [],
    description: content.overview || "No description available",
    backgroundImage: content.backdropUrl || content.backdropPath || FALLBACK_POSTER,
    posterImage: content.posterUrl || content.posterPath || FALLBACK_POSTER,
    director: null,
    cast: [],
    country: "Loading...",
    status: content.status || "Returning Series",
    quality: "HD",
    language:
      content.originalLanguage === "vi"
        ? "Vietsub"
        : content.originalLanguage?.toUpperCase() || "",
    contentType: "tv",
    voteCount: content.voteCount,
    popularity: content.popularity,
    scenes: [],
  };
}

function mergeMovieCredits(detail: MovieDetail, credits: Credits): MovieDetail {
  const directorPerson = credits.crew?.find(
    (person: CrewMember) => person.job === "Director" || person.job === "director"
  );
  const director = directorPerson
    ? { id: directorPerson.id, name: directorPerson.name }
    : null;

  return {
    ...detail,
    director,
    country: credits.production_countries?.[0]?.name || "Unknown",
    cast:
      credits.cast?.slice(0, 10)?.map((actor: CastMember) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
      })) || [],
    runtime: credits.runtime
      ? formatWatchDuration(Number(credits.runtime), "movie")
      : detail.runtime,
    status: credits.status || detail.status,
  };
}

export async function getMovieDetailPageDataByTmdbId(
  tmdbId: number,
  language: string
): Promise<MovieDetailPageDataResult> {
  try {
    const contentResult = await lookupContentByTmdbId(tmdbId, language);

    if (!contentResult.success || !contentResult.content) {
      return {
        movieData: null,
        contentType: null,
        error: contentResult.message || "Content not found",
      };
    }

    const contentType = contentResult.contentType;
    const mappedData =
      contentType === "movie"
        ? mapMovieToDetail(contentResult.content as Movie, language)
        : mapTVToMovieDetail(contentResult.content as TVSeries, language);

    if (contentType !== "movie") {
      return {
        movieData: mappedData,
        contentType,
        error: null,
      };
    }

    try {
      const creditsResponse = await apiService.getMovieCredits(
        mappedData.tmdbId || mappedData.id,
        language
      );
      if (creditsResponse.success && creditsResponse.data) {
        return {
          movieData: mergeMovieCredits(mappedData, creditsResponse.data),
          contentType,
          error: null,
        };
      }
    } catch {
      // Keep base data when credits fetch fails.
    }

    return {
      movieData: mappedData,
      contentType,
      error: null,
    };
  } catch (error) {
    return {
      movieData: null,
      contentType: null,
      error: error instanceof Error ? error.message : "Failed to fetch content",
    };
  }
}

export async function getTVDetailPageDataByTmdbId(
  tmdbId: number,
  language: string
): Promise<TVDetailPageDataResult> {
  const ensureNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  const ensureString = (value: unknown, fallback = ""): string =>
    typeof value === "string" && value.length > 0 ? value : fallback;

  const ensureOptionalString = (value: unknown): string | undefined =>
    typeof value === "string" && value.length > 0 ? value : undefined;

  const ensureBoolean = (value: unknown, fallback = false): boolean =>
    typeof value === "boolean" ? value : fallback;

  const ensureStringArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];

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

  try {
    const response = await apiService.getTVSeriesById(tmdbId, language);
    if (!response.success || !response.data) {
      return {
        tvData: null,
        error: response.message || "TV series not found",
      };
    }

    const tv = response.data as Movie & Record<string, unknown>;

    const id = ensureNumber(tv.id, tmdbId);
    const finalTmdbId = ensureNumber(tv.tmdbId, id);
    const title = ensureString(tv.title) || ensureString(tv.name) || "Untitled";
    const originalTitle =
      ensureString(tv.originalTitle) || ensureString(tv.original_name) || title;
    const firstAirDate =
      ensureOptionalString(tv.releaseDate) ??
      ensureOptionalString(tv.firstAirDate) ??
      ensureOptionalString(tv.first_air_date) ??
      "";
    const lastAirDate =
      ensureOptionalString(tv.lastAirDate) ?? ensureOptionalString(tv.last_air_date);

    const rawGenreIds = ensureNumberArray(
      (tv.genreIds as unknown) ?? (tv.genre_ids as unknown)
    );

    const createdBy = Array.isArray(tv.created_by)
      ? tv.created_by
          .map((creator) => {
            if (
              creator &&
              typeof creator === "object" &&
              "id" in creator &&
              "name" in creator
            ) {
              const record = creator as Record<string, unknown>;
              return {
                id: ensureNumber(record.id, 0),
                name: ensureString(record.name, "Unknown") || "Unknown",
              };
            }
            return null;
          })
          .filter(
            (creator): creator is { id: number; name: string } => creator !== null
          )
      : [];

    const productionCountries = Array.isArray(tv.production_countries)
      ? tv.production_countries
          .map((country) => {
            if (
              country &&
              typeof country === "object" &&
              "name" in country &&
              "iso_3166_1" in country
            ) {
              const record = country as Record<string, unknown>;
              return {
                name: ensureString(record.name, "Unknown"),
                iso_3166_1: ensureString(record.iso_3166_1, ""),
              };
            }
            return null;
          })
          .filter(
            (country): country is { name: string; iso_3166_1: string } =>
              country !== null
          )
      : [];

    let tvData: TVDetail = {
      id,
      tmdbId: finalTmdbId,
      title,
      originalTitle,
      overview: ensureString(tv.overview, "No overview available."),
      firstAirDate,
      lastAirDate,
      voteAverage: ensureNumber(tv.voteAverage ?? tv.vote_average, 0),
      voteCount: ensureNumber(tv.voteCount ?? tv.vote_count, 0),
      popularity: ensureNumber(tv.popularity, 0),
      posterPath: ensureString(
        tv.posterUrl ?? tv.posterPath ?? tv.poster_path,
        FALLBACK_POSTER
      ),
      backdropPath: ensureString(
        tv.backdropUrl ?? tv.backdropPath ?? tv.backdrop_path,
        FALLBACK_POSTER
      ),
      genres: rawGenreIds
        .map((genreId) => getLocalizedGenreNameById(genreId, language, "tv"))
        .filter((genre): genre is string => Boolean(genre)),
      genreIds: rawGenreIds,
      numberOfEpisodes: ensureNumber(
        tv.numberOfEpisodes ?? tv.number_of_episodes,
        0
      ),
      numberOfSeasons: ensureNumber(tv.numberOfSeasons ?? tv.number_of_seasons, 0),
      episodeRunTime: ensureNumberArray(
        (tv.episodeRunTime as unknown) ?? (tv.episode_run_time as unknown)
      ),
      status: ensureString(tv.status, "Unknown"),
      type: ensureOptionalString(tv.type),
      adult: ensureBoolean(tv.adult, false),
      inProduction: ensureBoolean(tv.inProduction ?? tv.in_production, false),
      originCountry: ensureStringArray(
        (tv.originCountry as unknown) ?? (tv.origin_country as unknown)
      ),
      originalLanguage: ensureString(
        tv.originalLanguage ?? tv.original_language,
        "unknown"
      ),
      createdBy,
      productionCountries,
      creator: null,
      country: ensureString(tv.country, "Loading..."),
      cast: [],
      crew: [],
    };

    try {
      const creditsResponse = await apiService.getTVCredits(finalTmdbId, language);
      if (creditsResponse.success && creditsResponse.data) {
        const credits = creditsResponse.data;
        const creatorPerson =
          credits.crew?.find((person: CrewMember) => person.job === "Creator") ||
          credits.created_by?.[0];

        tvData = {
          ...tvData,
          creator: creatorPerson
            ? { id: creatorPerson.id, name: creatorPerson.name }
            : null,
          country: credits.origin_country?.[0] || "Unknown",
          cast: credits.cast || [],
          crew: credits.crew || [],
        };
      }
    } catch {
      // Keep base TV data when credits fetch fails.
    }

    return { tvData, error: null };
  } catch (error) {
    return {
      tvData: null,
      error: error instanceof Error ? error.message : "Failed to fetch TV series",
    };
  }
}

function parseRouteContentId(
  id: string
): { type: "movie" | "tv" | "auto"; tmdbId: number } {
  if (id.startsWith("movie-")) {
    return { type: "movie", tmdbId: parseInt(id.replace("movie-", ""), 10) };
  }
  if (id.startsWith("tv-")) {
    return { type: "tv", tmdbId: parseInt(id.replace("tv-", ""), 10) };
  }
  return { type: "auto", tmdbId: parseInt(id, 10) };
}

const normalizeDuration = (value?: unknown): number | undefined => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return undefined;
};

export async function getWatchPageDataByRouteId(
  routeId: string,
  language: string,
  season: number,
  episode: number
): Promise<WatchPageDataResult> {
  try {
    const { tmdbId, type } = parseRouteContentId(routeId);
    if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
      return {
        movieData: null,
        credits: null,
        recommendations: [],
        streamCandidates: [],
        streamError: null,
        error: "Invalid content ID",
      };
    }

    const response =
      type === "tv"
        ? await apiService.getTVByTmdbId(tmdbId, language)
        : type === "movie"
        ? await apiService.getMovieByTmdbId(tmdbId, language)
        : await apiService.getContentById(tmdbId, language);

    if (!response.success || !response.content) {
      return {
        movieData: null,
        credits: null,
        recommendations: [],
        streamCandidates: [],
        streamError: null,
        error: response.message || "Content not found",
      };
    }

    const mappedData = mapContentToWatchContent(
      response as unknown as Parameters<typeof mapContentToWatchContent>[0],
      routeId
    );
    const contentType = (response.contentType ||
      mappedData.contentType) as ContentType;
    const effectiveTmdbId = mappedData.tmdbId || tmdbId;

    const [creditsResult, recommendationsResult] = await Promise.all([
      contentType === "movie"
        ? apiService.getMovieCredits(effectiveTmdbId, language)
        : apiService.getTVCredits(effectiveTmdbId, language),
      contentType === "movie"
        ? apiService.getMovieRecommendations(effectiveTmdbId, 1)
        : apiService.getTVRecommendations(effectiveTmdbId, 1),
    ]);

    const credits =
      creditsResult.success && creditsResult.data
        ? (creditsResult.data as WatchPageCredits)
        : null;

    const runtimeFromCredits = normalizeDuration(credits?.runtime);
    const movieData = runtimeFromCredits
      ? { ...mappedData, duration: runtimeFromCredits }
      : mappedData;

    type RawRecommendation = {
      tmdbId?: number;
      id?: number;
      title?: string;
      name?: string;
      posterPath?: string | null;
      poster_path?: string | null;
      releaseDate?: string;
      release_date?: string;
      firstAirDate?: string;
      first_air_date?: string;
      voteAverage?: number;
      vote_average?: number;
    };

    const rawRecommendations =
      recommendationsResult.success && Array.isArray(recommendationsResult.data)
        ? (recommendationsResult.data as RawRecommendation[])
        : [];

    const recommendations: WatchPageRecommendationItem[] = rawRecommendations
      .slice(0, 5)
      .map((item) => ({
        id: item.tmdbId ?? item.id ?? 0,
        title: item.title || item.name,
        name: item.name || item.title,
        poster_path: item.posterPath ?? item.poster_path ?? null,
        release_date: item.releaseDate || item.release_date || undefined,
        first_air_date: item.firstAirDate || item.first_air_date || undefined,
        vote_average: item.voteAverage ?? item.vote_average ?? 0,
      }));

    const dsLang = getDsLanguageFromLanguage(language);
    const streamOptions =
      contentType === "tv"
        ? { season, episode, dsLang, autoplay: true, autoNext: true }
        : { dsLang, autoplay: true };

    const streamResponse = await apiService.getStreamUrlByTmdbId(
      effectiveTmdbId,
      contentType === "tv" ? "tv" : "movie",
      streamOptions
    );

    let streamCandidates: string[] = [];
    let streamError: string | null = null;

    if (streamResponse.success && streamResponse.data?.url) {
      streamCandidates = [
        streamResponse.data.url,
        ...(streamResponse.data.fallbackUrls || []),
      ]
        .filter((url) => !!url)
        .filter((url, index, all) => all.indexOf(url) === index);
    } else {
      streamError = "No stream source available right now.";
    }

    return {
      movieData,
      credits,
      recommendations,
      streamCandidates,
      streamError,
      error: null,
    };
  } catch (error) {
    return {
      movieData: null,
      credits: null,
      recommendations: [],
      streamCandidates: [],
      streamError: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load content information",
    };
  }
}
