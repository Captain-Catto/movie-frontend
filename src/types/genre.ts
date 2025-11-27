// Genre Type Definitions and Mappings

// TMDB Movie Genres - English
export const TMDB_MOVIE_ENGLISH_GENRE_MAP: Record<number, string> = {
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

// TMDB TV Genres - English
export const TMDB_TV_ENGLISH_GENRE_MAP: Record<number, string> = {
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

// Combined genre map for unified access (Movies + TV)
export const TMDB_ENGLISH_GENRE_MAP: Record<number, string> = {
  ...TMDB_MOVIE_ENGLISH_GENRE_MAP,
  ...TMDB_TV_ENGLISH_GENRE_MAP,
};

// Reverse mapping: name to ID
export const GENRE_NAME_TO_ID: Record<string, number> = Object.entries(
  TMDB_ENGLISH_GENRE_MAP
).reduce((acc, [id, name]) => {
  acc[name] = Number(id);
  return acc;
}, {} as Record<string, number>);

/**
 * Get genre name by ID
 * @param id - TMDB genre ID
 * @param isTV - Whether this is a TV series genre
 * @returns Genre name in English
 */
export function getGenreName(id: number, isTV = false): string {
  const map = isTV ? TMDB_TV_ENGLISH_GENRE_MAP : TMDB_MOVIE_ENGLISH_GENRE_MAP;
  return map[id] || TMDB_ENGLISH_GENRE_MAP[id] || "Unknown";
}

/**
 * Get genre ID by name
 * @param name - Genre name in English
 * @returns TMDB genre ID or undefined if not found
 */
export function getGenreId(name: string): number | undefined {
  return GENRE_NAME_TO_ID[name];
}

/**
 * Map array of genre IDs to genre names
 * @param ids - Array of TMDB genre IDs
 * @param isTV - Whether these are TV series genres
 * @returns Array of genre names
 */
export function mapGenreIds(ids: number[], isTV = false): string[] {
  return ids.map(id => getGenreName(id, isTV));
}
