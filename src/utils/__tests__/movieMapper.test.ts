import { describe, it, expect } from "vitest";
import { mapMovieToFrontend, mapMoviesToFrontend } from "../movieMapper";
import type { MovieInput } from "@/types/movie";

describe("mapMovieToFrontend", () => {
  const basicMovie: MovieInput = {
    id: 12345,
    tmdbId: 12345,
    title: "Test Movie",
    posterPath: "/poster.jpg",
    backdropPath: "/backdrop.jpg",
    releaseDate: "2025-01-15",
    voteAverage: 7.8,
    genreIds: [28, 35],
    overview: "A test movie description",
  };

  it("should map basic movie data correctly", () => {
    const result = mapMovieToFrontend(basicMovie);

    expect(result.id).toBe("12345");
    expect(result.tmdbId).toBe(12345);
    expect(result.title).toBe("Test Movie");
    expect(result.description).toBe("A test movie description");
    expect(result.rating).toBe(7.8);
    expect(result.year).toBe(2025);
  });

  it("should construct correct image URLs", () => {
    const result = mapMovieToFrontend(basicMovie);

    expect(result.poster).toContain("image.tmdb.org");
    expect(result.poster).toContain("/poster.jpg");
    expect(result.backgroundImage).toContain("/backdrop.jpg");
    expect(result.posterImage).toContain("/poster.jpg");
  });

  it("should map genres correctly", () => {
    const result = mapMovieToFrontend(basicMovie);

    expect(result.genreIds).toEqual([28, 35]);
    expect(result.genres).toEqual(["Action", "Comedy"]);
    expect(result.genre).toBe("Action"); // Primary genre
  });

  it("should generate correct href and watchHref", () => {
    const result = mapMovieToFrontend(basicMovie);

    expect(result.href).toBe("/movie/12345");
    expect(result.watchHref).toBe("/watch/movie-12345");
  });

  it("should handle TV series content type", () => {
    const tvShow: MovieInput = {
      id: 12345,
      tmdbId: 12345,
      name: "Test TV Show",
      posterPath: "/poster.jpg",
      backdropPath: "/backdrop.jpg",
      first_air_date: "2025-01-15",
      firstAirDate: "2025-01-15",
      voteAverage: 7.8,
      genreIds: [28, 35],
      overview: "A test TV show description",
      media_type: "tv",
    };

    const result = mapMovieToFrontend(tvShow);

    expect(result.title).toBe("Test TV Show");
    expect(result.href).toBe("/tv/12345");
    expect(result.watchHref).toBe("/watch/tv-12345");
    expect(result.year).toBe(2025); // Should use first_air_date
  });

  it("should handle snake_case properties from TMDB API", () => {
    const snakeCaseMovie: MovieInput = {
      id: 12345,
      tmdbId: 12345,
      title: "Test Movie",
      poster_path: "/poster.jpg",
      backdrop_path: "/backdrop.jpg",
      release_date: "2025-01-15",
      vote_average: 7.8,
      genre_ids: [28, 35],
      overview: "Test description",
    };

    const result = mapMovieToFrontend(snakeCaseMovie);

    expect(result.rating).toBe(7.8);
    expect(result.year).toBe(2025);
    expect(result.genres).toEqual(["Action", "Comedy"]);
  });

  it("should handle camelCase properties from backend", () => {
    const camelCaseMovie: MovieInput = {
      id: 12345,
      tmdbId: 12345,
      title: "Test Movie",
      posterPath: "/poster.jpg",
      backdropPath: "/backdrop.jpg",
      releaseDate: "2025-01-15",
      voteAverage: 7.8,
      genreIds: [28, 35],
      overview: "Test description",
    };

    const result = mapMovieToFrontend(camelCaseMovie);

    expect(result.rating).toBe(7.8);
    expect(result.year).toBe(2025);
  });

  it("should use fallback poster for missing images", () => {
    const movieNoImages: MovieInput = {
      id: 12345,
      tmdbId: 12345,
      title: "Test Movie",
      overview: "Test",
    };

    const result = mapMovieToFrontend(movieNoImages);

    expect(result.poster).toBe("/images/no-poster.svg");
    expect(result.backgroundImage).toBe("/images/no-poster.svg");
  });

  it("should handle string genre IDs", () => {
    const movieStringGenres: MovieInput = {
      ...basicMovie,
      genreIds: ["28", "35"] as unknown as number[],
    };

    const result = mapMovieToFrontend(movieStringGenres);

    expect(result.genreIds).toEqual([28, 35]);
    expect(result.genres).toEqual(["Action", "Comedy"]);
  });

  it("should filter out invalid genre IDs", () => {
    const movieInvalidGenres: MovieInput = {
      ...basicMovie,
      genreIds: [28, NaN, 35, undefined] as unknown as number[],
    };

    const result = mapMovieToFrontend(movieInvalidGenres);

    expect(result.genreIds).toEqual([28, 35]);
    expect(result.genres).toEqual(["Action", "Comedy"]);
  });

  it("should handle missing title with fallback", () => {
    const movieNoTitle: MovieInput = {
      id: 12345,
      tmdbId: 12345,
      overview: "Test",
    };

    const result = mapMovieToFrontend(movieNoTitle);

    expect(result.title).toBe("Untitled");
  });

  it("should handle original title", () => {
    const movieOriginalTitle: MovieInput = {
      ...basicMovie,
      original_title: "Original Title",
    };

    const result = mapMovieToFrontend(movieOriginalTitle);

    expect(result.aliasTitle).toBe("Original Title");
  });

  it("should use title as alias if no original title", () => {
    const result = mapMovieToFrontend(basicMovie);

    expect(result.aliasTitle).toBe("Test Movie");
  });

  it("should round rating to 1 decimal", () => {
    const movieRating: MovieInput = {
      ...basicMovie,
      voteAverage: 7.856,
    };

    const result = mapMovieToFrontend(movieRating);

    expect(result.rating).toBe(7.9);
  });

  it("should handle missing rating", () => {
    const movieNoRating: MovieInput = {
      ...basicMovie,
      voteAverage: undefined,
    };

    const result = mapMovieToFrontend(movieNoRating);

    expect(result.rating).toBe(0);
  });

  it("should use current year if no release date", () => {
    const currentYear = new Date().getFullYear();
    const movieNoDate: MovieInput = {
      ...basicMovie,
      releaseDate: undefined,
    };

    const result = mapMovieToFrontend(movieNoDate);

    expect(result.year).toBe(currentYear);
  });

  it("should handle pre-existing full URLs", () => {
    const movieWithUrls: MovieInput = {
      ...basicMovie,
      posterUrl: "https://custom.cdn.com/poster.jpg",
      backdropUrl: "https://custom.cdn.com/backdrop.jpg",
    };

    const result = mapMovieToFrontend(movieWithUrls);

    expect(result.poster).toBe("https://custom.cdn.com/poster.jpg");
    expect(result.backgroundImage).toBe("https://custom.cdn.com/backdrop.jpg");
  });

  it('should handle genre fallback to "Uncategorized"', () => {
    const movieNoGenres: MovieInput = {
      ...basicMovie,
      genreIds: [],
    };

    const result = mapMovieToFrontend(movieNoGenres);

    expect(result.genre).toBe("Uncategorized");
    expect(result.genres).toEqual([]);
  });

  it("should throw error for missing tmdbId", () => {
    const movieNoId = {
      title: "Test",
      overview: "Test",
    } as unknown as MovieInput;

    expect(() => mapMovieToFrontend(movieNoId)).toThrow(/missing valid tmdbId/);
  });

  it("should handle string ID conversion", () => {
    const movieStringId: MovieInput = {
      ...basicMovie,
      id: "12345" as unknown as number,
      tmdbId: "12345" as unknown as number,
    };

    const result = mapMovieToFrontend(movieStringId);

    expect(result.tmdbId).toBe(12345);
    expect(result.id).toBe("12345");
  });

  it("should set default values for optional fields", () => {
    const result = mapMovieToFrontend(basicMovie);

    expect(result.duration).toBe("N/A");
    expect(result.season).toBeUndefined();
    expect(result.episode).toBeUndefined();
    expect(result.scenes).toEqual([]);
    expect(result.isComplete).toBe(true);
  });
});

describe("mapMoviesToFrontend", () => {
  it("should map array of movies", () => {
    const movies = [
      {
        id: 1,
        tmdbId: 1,
        title: "Movie 1",
        overview: "Test 1",
        posterPath: "/poster1.jpg",
        releaseDate: "2025-01-15",
        voteAverage: 7.5,
        genreIds: [28],
      },
      {
        id: 2,
        tmdbId: 2,
        title: "Movie 2",
        overview: "Test 2",
        posterPath: "/poster2.jpg",
        releaseDate: "2025-01-16",
        voteAverage: 8.0,
        genreIds: [35],
      },
    ] as unknown as Movie[];

    const results = mapMoviesToFrontend(movies);

    expect(results).toHaveLength(2);
    expect(results[0].title).toBe("Movie 1");
    expect(results[1].title).toBe("Movie 2");
    expect(results[0].rating).toBe(7.5);
    expect(results[1].rating).toBe(8);
  });

  it("should handle empty array", () => {
    const results = mapMoviesToFrontend([]);

    expect(results).toEqual([]);
  });
});
