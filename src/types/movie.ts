export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: Date | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  originalLanguage: string | null;
  adult: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

export interface MovieResponse {
  success: boolean;
  message: string;
  data: Movie[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    isOnDemandSync: boolean;
    loadedFromCache: boolean;
    page: number;
    appliedFilters: {
      genre: string | null;
      year: number | null;
      language: string;
    };
  };
  error?: string;
}

export interface MovieQuery {
  page?: number;
  limit?: number;
  genre?: string;
  year?: number;
  language?: string;
  sortBy?: string;
  countries?: string;
}

export interface TrendingResponse {
  success: boolean;
  message: string;
  data: any[];
  error?: string;
}

// Frontend movie interface (current structure)
export interface FrontendMovie {
  id: string;
  tmdbId: number; // Make tmdbId required instead of optional
  title: string;
  aliasTitle?: string;
  poster: string;
  href: string;
  watchHref?: string;
  year: number;
  rating?: number;
  duration?: string;
  season?: string;
  episode?: string;
  genre: string;
  genres: string[];
  description?: string;
  backgroundImage?: string;
  posterImage?: string;
  scenes?: string[];
  isComplete?: boolean;
  mediaType?: "movie" | "tv"; // Added for favorites tracking
}

// TV Series interfaces
export interface TVSeries {
  id: number;
  tmdbId: number;
  name: string;
  originalName: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: Date | null;
  lastAirDate: Date | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  originalLanguage: string | null;
  adult: boolean;
  numberOfEpisodes: number;
  numberOfSeasons: number;
  episodeRunTime: number[];
  status: string;
  inProduction: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

export interface TVSeriesResponse {
  success: boolean;
  message: string;
  data: TVSeries[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    isOnDemandSync: boolean;
    loadedFromCache: boolean;
    page: number;
    appliedFilters: {
      genre: string | null;
      year: number | null;
      language: string;
    };
  };
  error?: string;
}

// Frontend TV series interface
export interface FrontendTVSeries {
  id: string;
  tmdbId?: number;
  title: string;
  aliasTitle?: string;
  poster: string;
  href: string;
  watchHref?: string;
  year: number;
  rating?: number;
  duration?: string;
  episodeNumber?: number;
  totalEpisodes?: number;
  isComplete?: boolean;
  numberOfSeasons?: number;
  genre: string;
  genres: string[];
  description?: string;
  backgroundImage?: string;
  posterImage?: string;
  scenes?: string[];
}

export interface Category {
  id: string;
  name: string;
  backgroundImage: string;
}

// Video/Trailer interfaces
export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}
