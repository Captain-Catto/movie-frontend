import { describe, it, expect } from "vitest";
import {
  TMDB_MOVIE_GENRE_MAP,
  TMDB_TV_GENRE_MAP,
  TMDB_ENGLISH_GENRE_MAP,
  GENRE_NAME_TO_ID,
  mapGenreIdsToNames,
  getAllGenresFromFavorites,
  getAllGenreIdsFromFavorites,
  getGenreNameById,
  getGenreIdByName,
  getGenreName,
  getGenreId,
  mapGenreIds,
} from "../genreMapping";

describe("Genre Mapping Constants", () => {
  it("should have correct movie genres", () => {
    expect(TMDB_MOVIE_GENRE_MAP[28]).toBe("Action");
    expect(TMDB_MOVIE_GENRE_MAP[35]).toBe("Comedy");
    expect(TMDB_MOVIE_GENRE_MAP[18]).toBe("Drama");
    expect(TMDB_MOVIE_GENRE_MAP[878]).toBe("Science Fiction");
  });

  it("should have correct TV genres", () => {
    expect(TMDB_TV_GENRE_MAP[10759]).toBe("Action & Adventure");
    expect(TMDB_TV_GENRE_MAP[10765]).toBe("Sci-Fi & Fantasy");
    expect(TMDB_TV_GENRE_MAP[10762]).toBe("Kids");
  });

  it("should combine movie and TV genres in TMDB_ENGLISH_GENRE_MAP", () => {
    expect(TMDB_ENGLISH_GENRE_MAP[28]).toBe("Action"); // Movie
    expect(TMDB_ENGLISH_GENRE_MAP[10759]).toBe("Action & Adventure"); // TV
    expect(TMDB_ENGLISH_GENRE_MAP[35]).toBe("Comedy"); // Both
  });

  it("should have reverse mapping in GENRE_NAME_TO_ID", () => {
    expect(GENRE_NAME_TO_ID["Action"]).toBe(28);
    expect(GENRE_NAME_TO_ID["Comedy"]).toBe(35);
    expect(GENRE_NAME_TO_ID["Sci-Fi & Fantasy"]).toBe(10765);
  });
});

describe("mapGenreIdsToNames", () => {
  it("should map valid genre IDs to names", () => {
    expect(mapGenreIdsToNames([28, 35, 18])).toEqual([
      "Action",
      "Comedy",
      "Drama",
    ]);
  });

  it("should handle string IDs", () => {
    expect(mapGenreIdsToNames(["28", "35", "18"])).toEqual([
      "Action",
      "Comedy",
      "Drama",
    ]);
  });

  it("should filter out invalid IDs", () => {
    expect(mapGenreIdsToNames([28, 99999, 35])).toEqual(["Action", "Comedy"]);
  });

  it("should handle empty array", () => {
    expect(mapGenreIdsToNames([])).toEqual([]);
  });

  it("should handle null/undefined", () => {
    expect(mapGenreIdsToNames(null)).toEqual([]);
    expect(mapGenreIdsToNames(undefined)).toEqual([]);
  });

  it("should handle mixed valid and invalid IDs", () => {
    expect(mapGenreIdsToNames([28, NaN, 35, "invalid-id", 18])).toEqual([
      "Action",
      "Comedy",
      "Drama",
    ]);
  });
});

describe("getAllGenresFromFavorites", () => {
  it("should extract unique genres from favorites", () => {
    const favorites = [
      { genreIds: [28, 35], contentType: "movie" as const },
      { genreIds: [35, 18], contentType: "movie" as const },
      { genreIds: [10759], contentType: "tv" as const },
    ];
    const genres = getAllGenresFromFavorites(favorites);
    expect(genres).toEqual(["Action", "Action & Adventure", "Comedy", "Drama"]);
  });

  it("should return empty array for empty favorites", () => {
    expect(getAllGenresFromFavorites([])).toEqual([]);
  });

  it("should handle favorites without genreIds", () => {
    const favorites = [
      { contentType: "movie" as const },
      { genreIds: [28], contentType: "movie" as const },
    ];
    expect(getAllGenresFromFavorites(favorites)).toEqual(["Action"]);
  });

  it("should sort genres alphabetically", () => {
    const favorites = [
      { genreIds: [18, 28, 35], contentType: "movie" as const },
    ];
    const genres = getAllGenresFromFavorites(favorites);
    expect(genres).toEqual(["Action", "Comedy", "Drama"]);
  });
});

describe("getAllGenreIdsFromFavorites", () => {
  it("should extract unique genre IDs from favorites", () => {
    const favorites = [
      { genreIds: [28, 35], contentType: "movie" as const },
      { genreIds: [35, 18], contentType: "movie" as const },
    ];
    const ids = getAllGenreIdsFromFavorites(favorites);
    expect(ids).toEqual([18, 28, 35]); // Sorted
  });

  it("should return empty array for empty favorites", () => {
    expect(getAllGenreIdsFromFavorites([])).toEqual([]);
  });

  it("should sort IDs numerically", () => {
    const favorites = [
      { genreIds: [878, 28, 35], contentType: "movie" as const },
    ];
    expect(getAllGenreIdsFromFavorites(favorites)).toEqual([28, 35, 878]);
  });
});

describe("getGenreNameById", () => {
  it("should return genre name for valid ID", () => {
    expect(getGenreNameById(28)).toBe("Action");
    expect(getGenreNameById(35)).toBe("Comedy");
    expect(getGenreNameById(10765)).toBe("Sci-Fi & Fantasy");
  });

  it("should return fallback for invalid ID", () => {
    expect(getGenreNameById(99999)).toBe("Genre 99999");
    expect(getGenreNameById(0)).toBe("Genre 0");
  });
});

describe("getGenreIdByName", () => {
  it("should return genre ID for valid name", () => {
    expect(getGenreIdByName("Action")).toBe(28);
    expect(getGenreIdByName("Comedy")).toBe(35);
    expect(getGenreIdByName("Sci-Fi & Fantasy")).toBe(10765);
  });

  it("should return undefined for invalid name", () => {
    expect(getGenreIdByName("NonExistent")).toBeUndefined();
    expect(getGenreIdByName("")).toBeUndefined();
  });
});

describe("getGenreName", () => {
  it("should return movie genre name when isTV is false", () => {
    expect(getGenreName(28, false)).toBe("Action");
    expect(getGenreName(35, false)).toBe("Comedy");
  });

  it("should return TV genre name when isTV is true", () => {
    expect(getGenreName(10759, true)).toBe("Action & Adventure");
    expect(getGenreName(10765, true)).toBe("Sci-Fi & Fantasy");
  });

  it("should fallback to combined map if not in specific map", () => {
    // Genre 28 exists in movie map but also in combined map
    expect(getGenreName(28, true)).toBe("Action");
  });

  it('should return "Unknown" for invalid ID', () => {
    expect(getGenreName(99999, false)).toBe("Unknown");
    expect(getGenreName(99999, true)).toBe("Unknown");
  });
});

describe("getGenreId", () => {
  it("should return genre ID for valid name", () => {
    expect(getGenreId("Action")).toBe(28);
    expect(getGenreId("Comedy")).toBe(35);
    expect(getGenreId("Sci-Fi & Fantasy")).toBe(10765);
  });

  it("should return undefined for invalid name", () => {
    expect(getGenreId("NonExistent")).toBeUndefined();
  });
});

describe("mapGenreIds", () => {
  it("should map genre IDs to names for movies", () => {
    expect(mapGenreIds([28, 35, 18], false)).toEqual([
      "Action",
      "Comedy",
      "Drama",
    ]);
  });

  it("should map genre IDs to names for TV", () => {
    expect(mapGenreIds([10759, 10765, 35], true)).toEqual([
      "Action & Adventure",
      "Sci-Fi & Fantasy",
      "Comedy",
    ]);
  });

  it("should handle empty array", () => {
    expect(mapGenreIds([], false)).toEqual([]);
    expect(mapGenreIds([], true)).toEqual([]);
  });

  it("should return Unknown for invalid IDs", () => {
    expect(mapGenreIds([28, 99999, 35], false)).toEqual([
      "Action",
      "Unknown",
      "Comedy",
    ]);
  });
});
