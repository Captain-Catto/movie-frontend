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
  mediaType: "movie" | "tv";
  media_type?: "movie" | "tv"; // Backend field
  adult?: boolean;
}

export interface RecentSearch {
  id?: number; // DB ID (if logged in)
  query: string;
  type: "movie" | "tv" | "all";
  timestamp: Date;
  source: "local" | "database";
}

export interface SearchState {
  isModalOpen: boolean;
  query: string;
  results: SearchResult[];
  recentSearches: RecentSearch[];
  isLoading: boolean;
  selectedType: "movie" | "tv" | "all";
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
