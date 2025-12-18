import { describe, it, expect } from "vitest";
import {
  mapMovieToWatchContent,
  mapTVToWatchContent,
  mapContentToWatchContent,
  formatWatchDuration,
} from "../watchContentMapper";

describe("mapMovieToWatchContent", () => {
  const basicMovie = {
    data: {
      id: 12345,
      tmdbId: 12345,
      title: "Test Movie",
      originalTitle: "Original Test Movie",
      overview: "A test movie",
      releaseDate: "2025-01-15",
      voteAverage: 8.5,
      runtime: 120,
      genreIds: [28, 35],
      posterUrl: "https://example.com/poster.jpg",
      backdropUrl: "https://example.com/backdrop.jpg",
    },
  };

  it("should map basic movie data", () => {
    const result = mapMovieToWatchContent(basicMovie, "movie-12345");

    expect(result.id).toBe("movie-12345");
    expect(result.tmdbId).toBe(12345);
    expect(result.title).toBe("Test Movie");
    expect(result.aliasTitle).toBe("Original Test Movie");
    expect(result.description).toBe("A test movie");
    expect(result.rating).toBe(8.5);
    expect(result.duration).toBe(120);
    expect(result.year).toBe(2025);
    expect(result.contentType).toBe("movie");
  });

  it("should map genres correctly", () => {
    const result = mapMovieToWatchContent(basicMovie, "movie-12345");

    expect(result.genres).toEqual(["Action", "Comedy"]);
  });

  it("should use provided image URLs", () => {
    const result = mapMovieToWatchContent(basicMovie, "movie-12345");

    expect(result.posterImage).toBe("https://example.com/poster.jpg");
    expect(result.backgroundImage).toBe("https://example.com/backdrop.jpg");
  });

  it("should construct TMDB URLs from paths", () => {
    const withPaths = {
      data: {
        id: 12345,
        tmdbId: 12345,
        title: "Test",
        overview: "Test",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
      },
    };

    const result = mapMovieToWatchContent(withPaths, "movie-12345");

    expect(result.posterImage).toContain("image.tmdb.org");
    expect(result.posterImage).toContain("/poster.jpg");
    expect(result.backgroundImage).toContain("/backdrop.jpg");
  });

  it("should use fallback for missing images", () => {
    const noImages = {
      data: {
        id: 12345,
        title: "Test",
        overview: "Test",
      },
    };

    const result = mapMovieToWatchContent(noImages, "movie-12345");

    expect(result.posterImage).toBe("/images/no-poster.svg");
    expect(result.backgroundImage).toBe("/images/no-poster.svg");
  });

  it("should handle snake_case fields", () => {
    const snakeCase = {
      data: {
        id: 12345,
        tmdb_id: 12345,
        title: "Test",
        original_title: "Original",
        overview: "Test",
        release_date: "2025-01-15",
        vote_average: 7.5,
        runtime: 90,
        genre_ids: [28],
      },
    };

    const result = mapMovieToWatchContent(snakeCase, "movie-12345");

    expect(result.rating).toBe(7.5);
    expect(result.duration).toBe(90);
  });

  it("should handle content directly (not wrapped in data)", () => {
    const direct = {
      id: 12345,
      tmdbId: 12345,
      title: "Test",
      overview: "Test",
      voteAverage: 8.0,
    };

    const result = mapMovieToWatchContent(direct, "movie-12345");

    expect(result.title).toBe("Test");
    expect(result.rating).toBe(8);
  });

  it("should handle content field", () => {
    const withContent = {
      content: {
        id: 12345,
        tmdbId: 12345,
        title: "Test",
        overview: "Test",
      },
    };

    const result = mapMovieToWatchContent(withContent, "movie-12345");

    expect(result.title).toBe("Test");
  });

  it("should use fallback description if missing", () => {
    const noOverview = {
      data: {
        id: 12345,
        title: "Test",
      },
    };

    const result = mapMovieToWatchContent(noOverview, "movie-12345");

    expect(result.description).toBe("Không có mô tả");
  });

  it("should handle missing title with fallback", () => {
    const noTitle = {
      data: {
        id: 12345,
        overview: "Test",
      },
    };

    const result = mapMovieToWatchContent(noTitle, "movie-12345");

    expect(result.title).toBe("Untitled");
  });

  it("should use current year if no release date", () => {
    const currentYear = new Date().getFullYear();
    const noDate = {
      data: {
        id: 12345,
        title: "Test",
        overview: "Test",
      },
    };

    const result = mapMovieToWatchContent(noDate, "movie-12345");

    expect(result.year).toBe(currentYear);
  });
});

describe("mapTVToWatchContent", () => {
  const basicTV = {
    data: {
      id: 12345,
      tmdbId: 12345,
      name: "Test TV Show",
      original_name: "Original Test TV",
      overview: "A test TV show",
      firstAirDate: "2025-01-15",
      voteAverage: 8.5,
      episodeRunTime: [45],
      genreIds: [10759, 18],
      posterUrl: "https://example.com/poster.jpg",
      backdropUrl: "https://example.com/backdrop.jpg",
      numberOfSeasons: 3,
      numberOfEpisodes: 30,
      status: "Returning Series",
      type: "Scripted",
    },
  };

  it("should map basic TV data", () => {
    const result = mapTVToWatchContent(basicTV, "tv-12345");

    expect(result.id).toBe("tv-12345");
    expect(result.tmdbId).toBe(12345);
    expect(result.title).toBe("Test TV Show");
    expect(result.aliasTitle).toBe("Original Test TV");
    expect(result.description).toBe("A test TV show");
    expect(result.rating).toBe(8.5);
    expect(result.duration).toBe(45);
    expect(result.year).toBe(2025);
    expect(result.contentType).toBe("tv");
  });

  it("should include TV-specific fields", () => {
    const result = mapTVToWatchContent(basicTV, "tv-12345");

    expect(result.numberOfSeasons).toBe(3);
    expect(result.numberOfEpisodes).toBe(30);
    expect(result.status).toBe("Returning Series");
    expect(result.type).toBe("Scripted");
  });

  it("should map TV genres correctly", () => {
    const result = mapTVToWatchContent(basicTV, "tv-12345");

    expect(result.genres).toEqual(["Action & Adventure", "Drama"]);
  });

  it("should handle snake_case fields for TV", () => {
    const snakeCase = {
      data: {
        id: 12345,
        name: "Test",
        original_name: "Original",
        overview: "Test",
        first_air_date: "2025-01-15",
        vote_average: 7.5,
        episode_run_time: [30],
        genre_ids: [10759],
        number_of_seasons: 2,
        number_of_episodes: 20,
      },
    };

    const result = mapTVToWatchContent(snakeCase, "tv-12345");

    expect(result.rating).toBe(7.5);
    expect(result.duration).toBe(30);
    expect(result.numberOfSeasons).toBe(2);
  });

  it("should handle title field for TV", () => {
    const withTitle = {
      data: {
        id: 12345,
        title: "Title Field",
        name: "Name Field",
        overview: "Test",
      },
    };

    const result = mapTVToWatchContent(withTitle, "tv-12345");

    expect(result.title).toBe("Title Field");
  });

  it("should handle created_by field", () => {
    const withCreators = {
      data: {
        ...basicTV.data,
        created_by: [
          { id: 1, name: "Creator 1", profile_path: "/creator1.jpg" },
          { id: 2, name: "Creator 2" },
        ],
      },
    };

    const result = mapTVToWatchContent(withCreators, "tv-12345");

    expect(result.created_by).toHaveLength(2);
    expect(result.created_by?.[0].name).toBe("Creator 1");
  });
});

describe("mapContentToWatchContent", () => {
  it("should detect and map movie content", () => {
    const movieContent = {
      id: 12345,
      title: "Movie",
      overview: "Test",
      releaseDate: "2025-01-15",
      voteAverage: 8.0,
    };

    const result = mapContentToWatchContent(movieContent, "movie-12345");

    expect(result.contentType).toBe("movie");
    expect(result.title).toBe("Movie");
  });

  it("should detect and map TV content", () => {
    const tvContent = {
      id: 12345,
      name: "TV Show",
      overview: "Test",
      firstAirDate: "2025-01-15",
      numberOfSeasons: 3,
      voteAverage: 8.0,
    };

    const result = mapContentToWatchContent(tvContent, "tv-12345");

    expect(result.contentType).toBe("tv");
    expect(result.title).toBe("TV Show");
  });

  it("should use explicit media_type", () => {
    const withMediaType = {
      id: 12345,
      title: "Content",
      overview: "Test",
      media_type: "tv",
      releaseDate: "2025-01-15",
    };

    const result = mapContentToWatchContent(withMediaType, "content-12345");

    expect(result.contentType).toBe("tv");
  });

  it("should handle wrapped in data field", () => {
    const wrapped = {
      data: {
        id: 12345,
        title: "Movie",
        overview: "Test",
        releaseDate: "2025-01-15",
      },
    };

    const result = mapContentToWatchContent(wrapped, "movie-12345");

    expect(result.title).toBe("Movie");
  });
});

describe("formatWatchDuration", () => {
  it("should format movie duration", () => {
    expect(formatWatchDuration(120, "movie")).toBe("2h 0m");
    expect(formatWatchDuration(135, "movie")).toBe("2h 15m");
    expect(formatWatchDuration(90, "movie")).toBe("1h 30m");
  });

  it("should format TV episode duration", () => {
    expect(formatWatchDuration(45, "tv")).toBe("45m/ep");
    expect(formatWatchDuration(30, "tv")).toBe("30m/ep");
    expect(formatWatchDuration(60, "tv")).toBe("60m/ep");
  });

  it("should handle missing duration", () => {
    expect(formatWatchDuration(undefined, "movie")).toBe("");
    expect(formatWatchDuration(undefined, "tv")).toBe("");
  });

  it("should handle zero duration", () => {
    expect(formatWatchDuration(0, "movie")).toBe("");
    expect(formatWatchDuration(0, "tv")).toBe("");
  });

  it("should handle missing contentType", () => {
    // Default to movie format
    expect(formatWatchDuration(120)).toBe("2h 0m");
  });

  it("should handle exact hours", () => {
    expect(formatWatchDuration(60, "movie")).toBe("1h 0m");
    expect(formatWatchDuration(180, "movie")).toBe("3h 0m");
  });

  it("should handle large durations", () => {
    expect(formatWatchDuration(240, "movie")).toBe("4h 0m");
    expect(formatWatchDuration(250, "movie")).toBe("4h 10m");
  });
});
