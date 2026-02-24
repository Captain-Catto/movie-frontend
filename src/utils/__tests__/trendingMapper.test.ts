import { describe, it, expect } from "vitest";
import {
  mapTrendingToFrontend,
  mapTrendingDataToFrontend,
} from "../trendingMapper";
import type { TrendingItem } from "@/types/content.types";

describe("mapTrendingToFrontend", () => {
  const basicTrending = {
    tmdbId: 12345,
    title: "Trending Movie",
    overview: "A trending movie description",
    posterUrl: "https://example.com/poster.jpg",
    backdropUrl: "https://example.com/backdrop.jpg",
    genreIds: [28, 35],
    releaseDate: "2025-01-15",
    voteAverage: 8.7,
    mediaType: "movie",
    popularity: 1500,
  };

  it("should map basic trending data", () => {
    const result = mapTrendingToFrontend(basicTrending);

    expect(result.id).toBe("12345");
    expect(result.tmdbId).toBe(12345);
    expect(result.title).toBe("Trending Movie");
    expect(result.description).toBe("A trending movie description");
    expect(result.rating).toBe(8.7);
    expect(result.year).toBe(2025);
  });

  it("should use provided image URLs", () => {
    const result = mapTrendingToFrontend(basicTrending);

    expect(result.poster).toBe("https://example.com/poster.jpg");
    expect(result.backgroundImage).toBe("https://example.com/backdrop.jpg");
    expect(result.posterImage).toBe("https://example.com/poster.jpg");
  });

  it("should map genres correctly", () => {
    const result = mapTrendingToFrontend(basicTrending);

    expect(result.genreIds).toEqual([28, 35]);
    expect(result.genres).toEqual(["Action", "Comedy"]);
    expect(result.genre).toBe("Action");
  });

  it("should generate correct href for movies", () => {
    const result = mapTrendingToFrontend(basicTrending);

    expect(result.href).toBe("/movie/12345");
    expect(result.mediaType).toBe("movie");
  });

  it("should generate correct href for TV shows", () => {
    const tvTrending = {
      ...basicTrending,
      mediaType: "tv",
    };

    const result = mapTrendingToFrontend(tvTrending);

    expect(result.href).toBe("/tv/12345");
    expect(result.mediaType).toBe("tv");
  });

  it("should handle string tmdbId", () => {
    const stringId = {
      ...basicTrending,
      tmdbId: "12345",
    };

    const result = mapTrendingToFrontend(stringId);

    expect(result.tmdbId).toBe(12345);
    expect(result.id).toBe("12345");
  });

  it("should throw error for missing tmdbId", () => {
    const noId = {
      title: "Test",
      overview: "Test",
    };

    expect(() => mapTrendingToFrontend(noId as unknown as TrendingItem)).toThrow(
      /missing valid tmdbId/
    );
  });

  it("should throw error for invalid tmdbId", () => {
    const invalidId = {
      tmdbId: "invalid",
      title: "Test",
    };

    expect(() => mapTrendingToFrontend(invalidId as unknown as TrendingItem)).toThrow(
      /missing valid tmdbId/
    );
  });

  it("should use fallback poster for missing images", () => {
    const noImages = {
      tmdbId: 12345,
      title: "Test",
      overview: "Test",
    };

    const result = mapTrendingToFrontend(noImages);

    expect(result.poster).toBe("/images/no-poster.svg");
    expect(result.backgroundImage).toBe("/images/no-poster.svg");
  });

  it("should handle null image URLs", () => {
    const nullImages = {
      tmdbId: 12345,
      title: "Test",
      overview: "Test",
      posterUrl: null,
      backdropUrl: null,
    };

    const result = mapTrendingToFrontend(nullImages);

    expect(result.poster).toBe("/images/no-poster.svg");
    expect(result.backgroundImage).toBe("/images/no-poster.svg");
  });

  it("should handle empty genreIds array", () => {
    const noGenres = {
      ...basicTrending,
      genreIds: [],
    };

    const result = mapTrendingToFrontend(noGenres);

    expect(result.genreIds).toEqual([]);
    expect(result.genres).toEqual([]);
    expect(result.genre).toBe("Uncategorized");
  });

  it("should handle null genreIds", () => {
    const nullGenres = {
      ...basicTrending,
      genreIds: null,
    };

    const result = mapTrendingToFrontend(nullGenres);

    expect(result.genreIds).toEqual([]);
    expect(result.genres).toEqual([]);
  });

  it("should handle string genre IDs", () => {
    const stringGenres = {
      ...basicTrending,
      genreIds: ["28", "35"],
    };

    const result = mapTrendingToFrontend(stringGenres);

    expect(result.genreIds).toEqual([28, 35]);
    expect(result.genres).toEqual(["Action", "Comedy"]);
  });

  it("should filter invalid genre IDs", () => {
    const invalidGenres = {
      ...basicTrending,
      genreIds: [28, NaN, 35, "invalid"],
    };

    const result = mapTrendingToFrontend(invalidGenres);

    expect(result.genreIds).toEqual([28, 35]);
  });

  it("should handle string voteAverage", () => {
    const stringRating = {
      ...basicTrending,
      voteAverage: "8.5" as unknown as number,
    };

    const result = mapTrendingToFrontend(stringRating);

    expect(result.rating).toBe(8.5);
  });

  it("should handle missing voteAverage", () => {
    const noRating = {
      ...basicTrending,
      voteAverage: undefined,
    };

    const result = mapTrendingToFrontend(noRating);

    expect(result.rating).toBe(0);
  });

  it("should handle invalid voteAverage", () => {
    const invalidRating = {
      ...basicTrending,
      voteAverage: NaN,
    };

    const result = mapTrendingToFrontend(invalidRating);

    expect(result.rating).toBe(0);
  });

  it("should round rating to 1 decimal", () => {
    const preciseRating = {
      ...basicTrending,
      voteAverage: 8.456,
    };

    const result = mapTrendingToFrontend(preciseRating);

    expect(result.rating).toBe(8.5);
  });

  it("should use current year if no releaseDate", () => {
    const currentYear = new Date().getFullYear();
    const noDate = {
      ...basicTrending,
      releaseDate: undefined,
    };

    const result = mapTrendingToFrontend(noDate);

    expect(result.year).toBe(currentYear);
  });

  it("should set default values for optional fields", () => {
    const result = mapTrendingToFrontend(basicTrending);

    expect(result.duration).toBe("N/A");
    expect(result.season).toBeUndefined();
    expect(result.episode).toBeUndefined();
    expect(result.scenes).toEqual([]);
  });

  it("should set TV-specific fields for TV content", () => {
    const tvTrending = {
      ...basicTrending,
      mediaType: "tv",
    };

    const result = mapTrendingToFrontend(tvTrending);

    expect(result.season).toBe("Season 1");
    expect(result.episode).toBe("Multiple Episodes");
  });

  it("should use alias title same as title", () => {
    const result = mapTrendingToFrontend(basicTrending);

    expect(result.aliasTitle).toBe(result.title);
  });
});

describe("mapTrendingDataToFrontend", () => {
  const trendingList = [
    {
      tmdbId: 1,
      title: "Movie 1",
      overview: "Test 1",
      posterUrl: "https://example.com/1.jpg",
      backdropUrl: "https://example.com/1-back.jpg",
      genreIds: [28],
      releaseDate: "2025-01-15",
      voteAverage: 8.0,
      mediaType: "movie",
      popularity: 2000,
      isHidden: false,
    },
    {
      tmdbId: 2,
      title: "Movie 2",
      overview: "Test 2",
      posterUrl: "https://example.com/2.jpg",
      backdropUrl: "https://example.com/2-back.jpg",
      genreIds: [35],
      releaseDate: "2025-01-16",
      voteAverage: 7.5,
      mediaType: "movie",
      popularity: 1500,
      isHidden: false,
    },
    {
      tmdbId: 3,
      title: "Movie 3",
      overview: "Test 3",
      posterUrl: "https://example.com/3.jpg",
      backdropUrl: "https://example.com/3-back.jpg",
      genreIds: [18],
      releaseDate: "2025-01-17",
      voteAverage: 9.0,
      mediaType: "movie",
      popularity: 2500,
      isHidden: false,
    },
  ];

  it("should map array of trending items", () => {
    const results = mapTrendingDataToFrontend(trendingList);

    expect(results).toHaveLength(3);
    expect(results[0].title).toBe("Movie 3"); // Highest popularity first
    expect(results[1].title).toBe("Movie 1");
    expect(results[2].title).toBe("Movie 2");
  });

  it("should filter out hidden items", () => {
    const withHidden = [
      ...trendingList,
      {
        tmdbId: 4,
        title: "Hidden Movie",
        overview: "Hidden",
        posterUrl: "https://example.com/4.jpg",
        backdropUrl: "https://example.com/4-back.jpg",
        genreIds: [28],
        releaseDate: "2025-01-18",
        voteAverage: 8.5,
        mediaType: "movie",
        popularity: 3000,
        isHidden: true,
      },
    ];

    const results = mapTrendingDataToFrontend(withHidden);

    expect(results).toHaveLength(3);
    expect(results.find((r) => r.title === "Hidden Movie")).toBeUndefined();
  });

  it("should sort by popularity descending", () => {
    const results = mapTrendingDataToFrontend(trendingList);

    expect(results[0].title).toBe("Movie 3"); // popularity 2500
    expect(results[1].title).toBe("Movie 1"); // popularity 2000
    expect(results[2].title).toBe("Movie 2"); // popularity 1500
  });

  it("should handle items with undefined popularity", () => {
    const withUndefinedPop = [
      {
        tmdbId: 1,
        title: "Movie 1",
        overview: "Test",
        popularity: 1000,
      },
      {
        tmdbId: 2,
        title: "Movie 2",
        overview: "Test",
        popularity: undefined,
      },
    ];

    const results = mapTrendingDataToFrontend(withUndefinedPop);

    expect(results).toHaveLength(2);
    expect(results[0].title).toBe("Movie 1"); // Higher popularity first
  });

  it("should handle empty array", () => {
    const results = mapTrendingDataToFrontend([]);

    expect(results).toEqual([]);
  });

  it("should handle all hidden items", () => {
    const allHidden = trendingList.map((item) => ({
      ...item,
      isHidden: true,
    }));

    const results = mapTrendingDataToFrontend(allHidden);

    expect(results).toEqual([]);
  });
});
