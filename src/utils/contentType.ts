import { ContentType } from "@/types/content.types";

type Candidate = Record<string, unknown> | null | undefined;

const isString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const getLowerCase = (candidate: Candidate, keys: string[]): string | null => {
  if (!candidate || typeof candidate !== "object") return null;
  for (const key of keys) {
    const value = (candidate as Record<string, unknown>)[key];
    if (isString(value)) return value.toLowerCase();
  }
  return null;
};

/**
 * Detect if the candidate represents TV content based on common TMDB fields.
 */
export function isTVContent(candidate: Candidate): boolean {
  if (!candidate || typeof candidate !== "object") return false;

  const mediaType = getLowerCase(candidate, [
    "media_type",
    "mediaType",
    "contentType",
    "type",
  ]);
  if (mediaType === "tv") return true;

  if (
    "firstAirDate" in candidate ||
    "first_air_date" in candidate ||
    "numberOfSeasons" in candidate ||
    "number_of_seasons" in candidate ||
    "episodeRunTime" in candidate ||
    "episode_run_time" in candidate
  ) {
    return true;
  }

  return false;
}

export function isMovieContent(candidate: Candidate): boolean {
  if (!candidate || typeof candidate !== "object") return false;

  const mediaType = getLowerCase(candidate, [
    "media_type",
    "mediaType",
    "contentType",
    "type",
  ]);
  if (mediaType === "movie") return true;

  if ("releaseDate" in candidate || "release_date" in candidate) {
    return true;
  }

  return !isTVContent(candidate);
}

export function detectContentType(
  candidate: Candidate,
  fallback: ContentType = "movie"
): ContentType {
  if (isTVContent(candidate)) return "tv";
  if (isMovieContent(candidate)) return "movie";
  return fallback;
}
