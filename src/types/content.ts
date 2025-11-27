// Content Types - Unified content type definitions

import { Movie, TVSeries } from './movie';

// Content type union
export type ContentType = 'movie' | 'tv';

// Union of Movie and TV Series
export type Content = Movie | TVSeries;

// Content identifier
export interface ContentIdentifier {
  id: number;
  tmdbId: number;
  type: ContentType;
}

// Content metadata
export interface ContentMetadata {
  type: ContentType;
  isFavorite?: boolean;
  isWatched?: boolean;
  watchProgress?: number;
  lastWatchedAt?: string;
}

// Type guard to check if content is a Movie
export function isMovie(content: Content): content is Movie {
  return 'releaseDate' in content || 'release_date' in content;
}

// Type guard to check if content is a TV Series
export function isTVSeries(content: Content): content is TVSeries {
  return 'firstAirDate' in content || 'first_air_date' in content;
}

// Get content type from content object
export function getContentType(content: Content): ContentType {
  return isMovie(content) ? 'movie' : 'tv';
}
