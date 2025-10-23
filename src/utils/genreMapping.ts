// TMDB Genre mappings for frontend
export const MOVIE_GENRES: Record<number, string> = {
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

export const TV_GENRES: Record<number, string> = {
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
export const ALL_GENRES: Record<number, string> = {
  ...MOVIE_GENRES,
  ...TV_GENRES,
};

/**
 * Map genre IDs to genre names
 */
export function mapGenreIdsToNames(genreIds: number[]): string[] {
  if (!genreIds || !Array.isArray(genreIds)) {
    return [];
  }

  // Use ALL_GENRES which combines both movie and TV genres
  // This ensures we can map genres regardless of content type mismatches
  return genreIds.map((id) => ALL_GENRES[id]).filter(Boolean); // Remove undefined entries
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
  return ALL_GENRES[genreId] || `Genre ${genreId}`;
}

/**
 * Get genre ID by name
 */
export function getGenreIdByName(genreName: string): number | undefined {
  const entry = Object.entries(ALL_GENRES).find(
    ([, name]) => name === genreName
  );
  return entry ? parseInt(entry[0]) : undefined;
}
