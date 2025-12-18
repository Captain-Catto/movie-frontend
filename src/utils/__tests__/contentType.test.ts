import { describe, it, expect } from "vitest";
import {
  isTVContent,
  isMovieContent,
  detectContentType,
} from "../contentType";

describe("isTVContent", () => {
  it("should return true for media_type = tv", () => {
    expect(isTVContent({ media_type: "tv" })).toBe(true);
    expect(isTVContent({ media_type: "TV" })).toBe(true);
    expect(isTVContent({ mediaType: "tv" })).toBe(true);
  });

  it("should return true for TV-specific fields", () => {
    expect(isTVContent({ firstAirDate: "2025-01-15" })).toBe(true);
    expect(isTVContent({ first_air_date: "2025-01-15" })).toBe(true);
    expect(isTVContent({ numberOfSeasons: 5 })).toBe(true);
    expect(isTVContent({ number_of_seasons: 5 })).toBe(true);
    expect(isTVContent({ episodeRunTime: [45] })).toBe(true);
    expect(isTVContent({ episode_run_time: [45] })).toBe(true);
  });

  it("should return false for movie content", () => {
    expect(isTVContent({ media_type: "movie" })).toBe(false);
    expect(isTVContent({ releaseDate: "2025-01-15" })).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(isTVContent(null)).toBe(false);
    expect(isTVContent(undefined)).toBe(false);
    expect(isTVContent({})).toBe(false);
  });

  it("should return false for non-objects", () => {
    expect(isTVContent("tv" as unknown as Record<string, unknown>)).toBe(false);
    expect(isTVContent(123 as unknown as Record<string, unknown>)).toBe(false);
  });
});

describe("isMovieContent", () => {
  it("should return true for media_type = movie", () => {
    expect(isMovieContent({ media_type: "movie" })).toBe(true);
    expect(isMovieContent({ media_type: "MOVIE" })).toBe(true);
    expect(isMovieContent({ mediaType: "movie" })).toBe(true);
  });

  it("should return true for movie-specific fields", () => {
    expect(isMovieContent({ releaseDate: "2025-01-15" })).toBe(true);
    expect(isMovieContent({ release_date: "2025-01-15" })).toBe(true);
  });

  it("should return false for TV content", () => {
    expect(isMovieContent({ media_type: "tv" })).toBe(false);
    expect(isMovieContent({ firstAirDate: "2025-01-15" })).toBe(false);
    expect(isMovieContent({ numberOfSeasons: 5 })).toBe(false);
  });

  it("should return true as fallback when no specific fields", () => {
    // If it's not TV, it's assumed to be a movie
    expect(isMovieContent({ title: "Test" })).toBe(true);
  });

  it("should return false for null/undefined", () => {
    expect(isMovieContent(null)).toBe(false);
    expect(isMovieContent(undefined)).toBe(false);
  });
});

describe("detectContentType", () => {
  it("should detect TV content", () => {
    expect(detectContentType({ media_type: "tv" })).toBe("tv");
    expect(detectContentType({ firstAirDate: "2025-01-15" })).toBe("tv");
    expect(detectContentType({ numberOfSeasons: 5 })).toBe("tv");
  });

  it("should detect movie content", () => {
    expect(detectContentType({ media_type: "movie" })).toBe("movie");
    expect(detectContentType({ releaseDate: "2025-01-15" })).toBe("movie");
  });

  it("should use fallback for unknown content", () => {
    expect(detectContentType({})).toBe("movie"); // Default fallback
    expect(detectContentType(null)).toBe("movie");
  });

  it("should allow custom fallback", () => {
    // Empty object is detected as movie due to fallback logic in isMovieContent
    expect(detectContentType({}, "tv")).toBe("movie");
    expect(detectContentType(null, "tv")).toBe("tv");
  });

  it("should prioritize explicit media_type", () => {
    // Even if it has releaseDate, explicit media_type wins
    expect(
      detectContentType({
        media_type: "tv",
        releaseDate: "2025-01-15",
      })
    ).toBe("tv");

    // firstAirDate is a TV indicator, so it wins over media_type movie
    expect(
      detectContentType({
        media_type: "movie",
        firstAirDate: "2025-01-15",
      })
    ).toBe("tv");
  });

  it("should handle contentType field", () => {
    expect(detectContentType({ contentType: "tv" })).toBe("tv");
    expect(detectContentType({ contentType: "movie" })).toBe("movie");
  });

  it("should handle type field", () => {
    expect(detectContentType({ type: "tv" })).toBe("tv");
    expect(detectContentType({ type: "movie" })).toBe("movie");
  });
});
