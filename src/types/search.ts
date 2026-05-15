export interface SearchResult {
  id: string;
  tmdbId: number;
  title: string;
  originalTitle?: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  genreIds?: number[]; // Backend returns number array
  originalLanguage?: string;
  profilePath?: string;
  mediaType: "movie" | "tv" | "person";
  media_type?: "movie" | "tv" | "person"; // Backend field
  adult?: boolean;
}

export type SearchFilterType = "movie" | "tv" | "person" | "all";

export interface RecentSearch {
  id?: number; // DB ID (if logged in)
  query: string;
  type: SearchFilterType;
  timestamp: Date;
  source: "local" | "database";
}

export interface SearchState {
  isModalOpen: boolean;
  query: string;
  results: SearchResult[];
  recentSearches: RecentSearch[];
  isLoading: boolean;
  selectedType: SearchFilterType;
  hasMore: boolean;
  page: number;
}

export interface SearchAPIResponse {
  success: boolean;
  data: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
