// TMDB genre mappings (canonical)
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

// Combined genre mapping
export const TMDB_ENGLISH_GENRE_MAP: Record<number, string> = {
  ...TMDB_MOVIE_GENRE_MAP,
  ...TMDB_TV_GENRE_MAP,
};

export const GENRE_NAME_TO_ID: Record<string, number> = Object.entries(
  TMDB_ENGLISH_GENRE_MAP
).reduce((acc, [id, name]) => {
  acc[name] = Number(id);
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
  genreIds: Array<number | string> | null | undefined
): string[] {
  if (!genreIds || !Array.isArray(genreIds)) return [];

  return genreIds
    .map((id) => TMDB_ENGLISH_GENRE_MAP[Number(id)])
    .filter(Boolean);
}

/**
 * Get all unique genres from a list of favorites
 */
export function getAllGenresFromFavorites(
  favorites: Array<{ genreIds?: number[]; contentType?: "movie" | "tv" }>
): string[] {
  const allGenres = new Set<string>();

  favorites.forEach((favorite) => {
    if (favorite.genreIds && favorite.contentType) {
      const genres = mapGenreIdsToNames(favorite.genreIds);
      genres.forEach((genre) => allGenres.add(genre));
    }
  });

  return Array.from(allGenres).sort();
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
export function getGenreNameById(genreId: number): string {
  return TMDB_ENGLISH_GENRE_MAP[genreId] || `Genre ${genreId}`;
}

/**
 * Get genre ID by name
 */
export function getGenreIdByName(genreName: string): number | undefined {
  const entry = Object.entries(TMDB_ENGLISH_GENRE_MAP).find(([, name]) => name === genreName);
  return entry ? parseInt(entry[0]) : undefined;
}

/**
 * Get genre name by ID with optional TV override
 */
export function getGenreName(id: number, isTV = false): string {
  const map = isTV ? TMDB_TV_GENRE_MAP : TMDB_MOVIE_GENRE_MAP;
  return map[id] || TMDB_ENGLISH_GENRE_MAP[id] || "Unknown";
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
export function mapGenreIds(ids: number[], isTV = false): string[] {
  return ids.map((id) => getGenreName(id, isTV));
}
