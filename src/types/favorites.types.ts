// Favorites Types

import type { ContentType } from "./content.types";

export interface AddFavoriteDto {
  contentId: string;
  contentType: ContentType;
}

export interface Favorite {
  id: number;
  userid: number;
  contentid: string;
  contenttype: ContentType;
  createdat: string;
  title?: string;
  name?: string;
  posterpath?: string;
  backdroppath?: string;
  overview?: string;
  voteaverage?: string;
  releasedate?: string;
  firstairdate?: string;
  genreids?: (number | string)[];
  genres?: string[];
}

export interface RawFavoritesResponse {
  favorites: Favorite[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ProcessedFavorite {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  genres: string[];
  media_type: ContentType;
}

export interface FavoritesResponse {
  favorites: ProcessedFavorite[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FavoriteQueryParams {
  page?: number;
  limit?: number;
}
