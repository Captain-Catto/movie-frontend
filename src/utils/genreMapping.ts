// TMDB genre mappings (canonical EN)
export const TMDB_MOVIE_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export const TMDB_TV_GENRE_MAP: Record<number, string> = {
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

// Localized VI maps
export const TMDB_MOVIE_GENRE_MAP_VI: Record<number, string> = {
  28: "Hành động",
  12: "Phiêu lưu",
  16: "Hoạt hình",
  35: "Hài",
  80: "Tội phạm",
  99: "Tài liệu",
  18: "Chính kịch",
  10751: "Gia đình",
  14: "Giả tưởng",
  36: "Lịch sử",
  27: "Kinh dị",
  10402: "Âm nhạc",
  9648: "Bí ẩn",
  10749: "Lãng mạn",
  878: "Khoa học viễn tưởng",
  10770: "Phim truyền hình",
  53: "Giật gân",
  10752: "Chiến tranh",
  37: "Viễn tây",
};

export const TMDB_TV_GENRE_MAP_VI: Record<number, string> = {
  10759: "Hành động & Phiêu lưu",
  16: "Hoạt hình",
  35: "Hài",
  80: "Tội phạm",
  99: "Tài liệu",
  18: "Chính kịch",
  10751: "Gia đình",
  10762: "Trẻ em",
  9648: "Bí ẩn",
  10763: "Tin tức",
  10764: "Truyền hình thực tế",
  10765: "Khoa học viễn tưởng & Giả tưởng",
  10766: "Phim dài tập",
  10767: "Talk show",
  10768: "Chiến tranh & Chính trị",
  37: "Viễn tây",
};

// Combined mappings
export const TMDB_ENGLISH_GENRE_MAP: Record<number, string> = {
  ...TMDB_MOVIE_GENRE_MAP,
  ...TMDB_TV_GENRE_MAP,
};

export const TMDB_VIETNAMESE_GENRE_MAP: Record<number, string> = {
  ...TMDB_MOVIE_GENRE_MAP_VI,
  ...TMDB_TV_GENRE_MAP_VI,
};

const isVietnameseLanguage = (language?: string): boolean =>
  typeof language === "string" && language.toLowerCase().startsWith("vi");

const getGenreMapForContentType = (
  contentType?: "movie" | "tv",
  language = "en-US"
): Record<number, string> => {
  const isVi = isVietnameseLanguage(language);
  if (contentType === "movie") {
    return isVi ? TMDB_MOVIE_GENRE_MAP_VI : TMDB_MOVIE_GENRE_MAP;
  }
  if (contentType === "tv") {
    return isVi ? TMDB_TV_GENRE_MAP_VI : TMDB_TV_GENRE_MAP;
  }
  return isVi ? TMDB_VIETNAMESE_GENRE_MAP : TMDB_ENGLISH_GENRE_MAP;
};

export function getLocalizedGenreMap(
  language = "en-US",
  contentType?: "movie" | "tv"
): Record<number, string> {
  return getGenreMapForContentType(contentType, language);
}

export function getLocalizedGenreNameById(
  genreId: number,
  language = "en-US",
  contentType?: "movie" | "tv"
): string | undefined {
  const isVi = isVietnameseLanguage(language);
  const localizedMap = getGenreMapForContentType(contentType, language);
  if (localizedMap[genreId]) {
    return localizedMap[genreId];
  }

  const primaryCombinedMap = isVi
    ? TMDB_VIETNAMESE_GENRE_MAP
    : TMDB_ENGLISH_GENRE_MAP;
  if (primaryCombinedMap[genreId]) {
    return primaryCombinedMap[genreId];
  }

  const secondaryCombinedMap = isVi
    ? TMDB_ENGLISH_GENRE_MAP
    : TMDB_VIETNAMESE_GENRE_MAP;
  return secondaryCombinedMap[genreId];
}

export const GENRE_NAME_TO_ID: Record<string, number> = [
  TMDB_ENGLISH_GENRE_MAP,
  TMDB_VIETNAMESE_GENRE_MAP,
].reduce((acc, map) => {
  Object.entries(map).forEach(([id, name]) => {
    acc[name] = Number(id);
    acc[name.toLowerCase()] = Number(id);
  });
  return acc;
}, {} as Record<string, number>);

// Backwards-compatible aliases
export const MOVIE_GENRES = TMDB_MOVIE_GENRE_MAP;
export const TV_GENRES = TMDB_TV_GENRE_MAP;
export const ALL_GENRES = TMDB_ENGLISH_GENRE_MAP;

/**
 * Map genre IDs to genre names
 */
export function mapGenreIdsToNames(
  genreIds: Array<number | string> | null | undefined,
  language = "en-US",
  contentType?: "movie" | "tv"
): string[] {
  if (!genreIds || !Array.isArray(genreIds)) return [];

  return genreIds
    .map((id) =>
      getLocalizedGenreNameById(Number(id), language, contentType)
    )
    .filter((name): name is string => Boolean(name));
}

/**
 * Get all unique genres from a list of favorites
 */
export function getAllGenresFromFavorites(
  favorites: Array<{ genreIds?: number[]; contentType?: "movie" | "tv" }>,
  language = "en-US"
): string[] {
  const allGenres = new Set<string>();

  favorites.forEach((favorite) => {
    if (favorite.genreIds && favorite.contentType) {
      const genres = mapGenreIdsToNames(
        favorite.genreIds,
        language,
        favorite.contentType
      );
      genres.forEach((genre) => allGenres.add(genre));
    }
  });

  return Array.from(allGenres).sort((a, b) => a.localeCompare(b));
}

/**
 * Get all unique genre IDs from a list of favorites
 */
export function getAllGenreIdsFromFavorites(
  favorites: Array<{ genreIds?: number[]; contentType?: "movie" | "tv" }>
): number[] {
  const allGenreIds = new Set<number>();

  favorites.forEach((favorite) => {
    if (favorite.genreIds) {
      favorite.genreIds.forEach((id) => allGenreIds.add(id));
    }
  });

  return Array.from(allGenreIds).sort((a, b) => a - b);
}

/**
 * Get genre name by ID
 */
export function getGenreNameById(
  genreId: number,
  language = "en-US",
  contentType?: "movie" | "tv"
): string {
  return (
    getLocalizedGenreNameById(genreId, language, contentType) ||
    `Genre ${genreId}`
  );
}

/**
 * Get genre ID by name
 */
export function getGenreIdByName(genreName: string): number | undefined {
  const exactMatch = GENRE_NAME_TO_ID[genreName];
  if (exactMatch !== undefined) return exactMatch;
  return GENRE_NAME_TO_ID[genreName.toLowerCase()];
}

/**
 * Get genre name by ID with optional TV override
 */
export function getGenreName(
  id: number,
  isTV = false,
  language = "en-US"
): string {
  return (
    getLocalizedGenreNameById(id, language, isTV ? "tv" : "movie") ||
    "Unknown"
  );
}

/**
 * Get genre ID by name
 */
export function getGenreId(name: string): number | undefined {
  return GENRE_NAME_TO_ID[name] ?? getGenreIdByName(name);
}

/**
 * Map array of genre IDs to genre names
 */
export function mapGenreIds(
  ids: number[],
  isTV = false,
  language = "en-US"
): string[] {
  return ids.map((id) => getGenreName(id, isTV, language));
}
