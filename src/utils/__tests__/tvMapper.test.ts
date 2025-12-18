import { describe, it, expect } from "vitest";
import {
  mapTVSeriesToFrontend,
  mapTVSeriesToFrontendList,
} from "../tvMapper";

describe("mapTVSeriesToFrontend", () => {
  const basicTVSeries = {
    id: 12345,
    tmdbId: 12345,
    name: "Test TV Show",
    poster_path: "/poster.jpg",
    backdrop_path: "/backdrop.jpg",
    first_air_date: "2025-01-15",
    vote_average: 8.5,
    genreIds: [10759, 18],
    overview: "A test TV show",
    numberOfSeasons: 3,
    numberOfEpisodes: 30,
    episodeRunTime: [45, 50],
    status: "Returning Series",
  };

  it("should map basic TV series data", () => {
    const result = mapTVSeriesToFrontend(basicTVSeries);

    expect(result.tmdbId).toBe(12345);
    expect(result.title).toBe("Test TV Show");
    expect(result.description).toBe("A test TV show");
    expect(result.rating).toBe(8.5);
    expect(result.year).toBe(2025);
  });

  it("should construct correct URLs", () => {
    const result = mapTVSeriesToFrontend(basicTVSeries);

    expect(result.poster).toContain("image.tmdb.org");
    expect(result.poster).toContain("/poster.jpg");
    expect(result.backgroundImage).toContain("/backdrop.jpg");
    expect(result.href).toBe("/tv/12345");
    expect(result.watchHref).toBe("/watch/tv-12345");
  });

  it("should map TV genres correctly", () => {
    const result = mapTVSeriesToFrontend(basicTVSeries);

    expect(result.genreIds).toEqual([10759, 18]);
    expect(result.genres).toEqual(["Action & Adventure", "Drama"]);
    expect(result.genre).toBe("Action & Adventure");
  });

  it("should handle TV-specific fields", () => {
    const result = mapTVSeriesToFrontend(basicTVSeries);

    expect(result.numberOfSeasons).toBe(3);
    expect(result.episodeNumber).toBe(30);
    expect(result.totalEpisodes).toBe(30);
    expect(result.duration).toBe("45m/ep");
  });

  it("should determine isComplete based on status", () => {
    const endedSeries = { ...basicTVSeries, status: "Ended" };
    expect(mapTVSeriesToFrontend(endedSeries).isComplete).toBe(true);

    // Returning series without inProduction field defaults to inProduction=false -> isComplete=true
    const returningSeries = {
      ...basicTVSeries,
      status: "Returning Series",
      inProduction: true,
    };
    expect(mapTVSeriesToFrontend(returningSeries).isComplete).toBe(false);
  });

  it("should handle inProduction field", () => {
    const inProd = { ...basicTVSeries, inProduction: true, status: "Ongoing" };
    expect(mapTVSeriesToFrontend(inProd).isComplete).toBe(false);

    const notInProd = {
      ...basicTVSeries,
      inProduction: false,
      status: "Ongoing",
    };
    expect(mapTVSeriesToFrontend(notInProd).isComplete).toBe(true);
  });

  it("should handle snake_case fields", () => {
    const snakeCaseSeries = {
      id: 12345,
      tmdbId: 12345,
      name: "Test",
      first_air_date: "2025-01-15",
      vote_average: 7.5,
      genre_ids: [10759],
      poster_path: "/poster.jpg",
      backdrop_path: "/backdrop.jpg",
      overview: "Test",
      number_of_seasons: 2,
      number_of_episodes: 20,
      episode_run_time: [30],
      in_production: false,
    };

    const result = mapTVSeriesToFrontend(snakeCaseSeries);

    expect(result.rating).toBe(7.5);
    expect(result.numberOfSeasons).toBe(2);
    expect(result.episodeNumber).toBe(20);
  });

  it("should handle camelCase fields", () => {
    const camelCaseSeries = {
      id: 12345,
      tmdbId: 12345,
      name: "Test",
      firstAirDate: "2025-01-15",
      voteAverage: 7.5,
      genreIds: [10759],
      posterUrl: "https://example.com/poster.jpg",
      backdropUrl: "https://example.com/backdrop.jpg",
      overview: "Test",
      numberOfSeasons: 2,
      numberOfEpisodes: 20,
      episodeRunTime: [30],
      inProduction: false,
    };

    const result = mapTVSeriesToFrontend(camelCaseSeries);

    expect(result.rating).toBe(7.5);
    expect(result.numberOfSeasons).toBe(2);
  });

  it("should use fallback poster for missing images", () => {
    const noImages = {
      id: 12345,
      tmdbId: 12345,
      name: "Test",
      overview: "Test",
    };

    const result = mapTVSeriesToFrontend(noImages);

    expect(result.poster).toBe("/images/no-poster.svg");
    expect(result.backgroundImage).toBe("/images/no-poster.svg");
  });

  it("should handle missing title with fallback", () => {
    const noTitle = {
      id: 12345,
      tmdbId: 12345,
      overview: "Test",
    };

    const result = mapTVSeriesToFrontend(noTitle);

    expect(result.title).toBe("Unknown");
  });

  it("should handle title vs name field", () => {
    const withTitle = {
      id: 12345,
      tmdbId: 12345,
      title: "Title Field",
      name: "Name Field",
      overview: "Test",
    };

    const result = mapTVSeriesToFrontend(withTitle);
    // name takes precedence for TV series
    expect(result.title).toBe("Name Field");
  });

  it("should handle original name/title for alias", () => {
    const withOriginal = {
      id: 12345,
      tmdbId: 12345,
      name: "Show Name",
      originalName: "Original Name",
      overview: "Test",
    };

    const result = mapTVSeriesToFrontend(withOriginal);

    expect(result.aliasTitle).toBe("Original Name");
  });

  it("should use title as alias if no original", () => {
    const result = mapTVSeriesToFrontend(basicTVSeries);

    expect(result.aliasTitle).toBe("Test TV Show");
  });

  it("should default to TV Series genre if no genres", () => {
    const noGenres = {
      id: 12345,
      tmdbId: 12345,
      name: "Test",
      overview: "Test",
    };

    const result = mapTVSeriesToFrontend(noGenres);

    expect(result.genre).toBe("TV Series");
    expect(result.genres).toEqual([]);
  });

  it("should handle string genre IDs", () => {
    const stringGenres = {
      ...basicTVSeries,
      genreIds: ["10759", "18"],
    };

    const result = mapTVSeriesToFrontend(stringGenres);

    expect(result.genreIds).toEqual([10759, 18]);
    expect(result.genres).toEqual(["Action & Adventure", "Drama"]);
  });

  it("should filter invalid genre IDs", () => {
    const invalidGenres = {
      ...basicTVSeries,
      genreIds: [10759, "invalid", 18, null, undefined],
    };

    const result = mapTVSeriesToFrontend(invalidGenres);

    // NaN from invalid string conversion is filtered out, null/undefined are filtered
    expect(result.genreIds).toEqual([10759, 18]);
  });

  it("should default numberOfSeasons to 1", () => {
    const noSeasons = {
      id: 12345,
      tmdbId: 12345,
      name: "Test",
      overview: "Test",
    };

    const result = mapTVSeriesToFrontend(noSeasons);

    expect(result.numberOfSeasons).toBe(1);
  });

  it("should format duration as N/A if no episodeRunTime", () => {
    const noDuration = {
      id: 12345,
      tmdbId: 12345,
      name: "Test",
      overview: "Test",
    };

    const result = mapTVSeriesToFrontend(noDuration);

    expect(result.duration).toBe("N/A");
  });

  it("should use current year if no first_air_date", () => {
    const currentYear = new Date().getFullYear();
    const noDate = {
      id: 12345,
      tmdbId: 12345,
      name: "Test",
      overview: "Test",
    };

    const result = mapTVSeriesToFrontend(noDate);

    expect(result.year).toBe(currentYear);
  });

  it("should throw error for missing tmdbId", () => {
    const noId = {
      name: "Test",
      overview: "Test",
    };

    expect(() => mapTVSeriesToFrontend(noId)).toThrow(
      /missing a valid tmdbId/
    );
  });

  it("should handle string ID conversion", () => {
    const stringId = {
      id: "12345",
      tmdbId: "12345",
      name: "Test",
      overview: "Test",
    };

    const result = mapTVSeriesToFrontend(stringId);

    expect(result.tmdbId).toBe(12345);
  });

  it("should handle pre-existing full URLs", () => {
    const withUrls = {
      ...basicTVSeries,
      posterUrl: "https://custom.cdn.com/poster.jpg",
      backdropUrl: "https://custom.cdn.com/backdrop.jpg",
    };

    const result = mapTVSeriesToFrontend(withUrls);

    expect(result.poster).toBe("https://custom.cdn.com/poster.jpg");
    expect(result.backgroundImage).toBe("https://custom.cdn.com/backdrop.jpg");
  });

  it("should set scenes to empty array", () => {
    const result = mapTVSeriesToFrontend(basicTVSeries);

    expect(result.scenes).toEqual([]);
  });
});

describe("mapTVSeriesToFrontendList", () => {
  it("should map array of TV series", () => {
    const tvSeriesList = [
      {
        id: 1,
        tmdbId: 1,
        name: "Show 1",
        overview: "Test 1",
        poster_path: "/poster1.jpg",
        first_air_date: "2025-01-15",
        vote_average: 8.0,
        genreIds: [10759],
      },
      {
        id: 2,
        tmdbId: 2,
        name: "Show 2",
        overview: "Test 2",
        poster_path: "/poster2.jpg",
        first_air_date: "2025-01-16",
        vote_average: 7.5,
        genreIds: [18],
      },
    ] as unknown as TVSeries[];

    const results = mapTVSeriesToFrontendList(tvSeriesList);

    expect(results).toHaveLength(2);
    expect(results[0].title).toBe("Show 1");
    expect(results[1].title).toBe("Show 2");
    expect(results[0].rating).toBe(8);
    expect(results[1].rating).toBe(7.5);
  });

  it("should handle empty array", () => {
    const results = mapTVSeriesToFrontendList([]);

    expect(results).toEqual([]);
  });
});
