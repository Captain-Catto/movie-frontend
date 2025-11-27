// UI Component Props - Centralized prop type definitions

import { Movie, TVSeries } from './movie';

// Pagination component props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

// Table filter options
export interface TableFilterOptions {
  countries: string[];
  movieType: string;
  genres: string[];
  years: string[];
  customYear: string;
  sortBy: string;
  ratings?: string[];
  versions?: string[];
  qualities?: string[];
  languages?: string[];
}

export interface TableFiltersProps {
  onFilterChange?: (filters: TableFilterOptions) => void;
  onClose?: () => void;
  className?: string;
  showToggle?: boolean;
  initialFilters?: TableFilterOptions;
}

// Admin component props
export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

// Movie card props
export interface MovieCardProps {
  movie: Movie | TVSeries;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

// Hero section props
export interface HeroSectionProps {
  movie: Movie | TVSeries;
  type: 'movie' | 'tv';
  className?: string;
}

// Header props
export interface HeaderProps {
  hideOnPlay?: boolean;
  isPlaying?: boolean;
}

// Layout props
export interface LayoutProps {
  children: React.ReactNode;
  hideHeaderOnPlay?: boolean;
  isPlaying?: boolean;
}

// Trailer modal props
export interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoKey: string;
  title: string;
}

// Search results props
export interface SearchResultsProps {
  query: string;
  results: Array<Movie | TVSeries>;
  isLoading?: boolean;
}

// Favorite button props
export interface FavoriteButtonProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    media_type: string;
    overview?: string;
    genres?: Array<{ id: number; name: string }>;
  };
  iconOnly?: boolean;
  className?: string;
}
