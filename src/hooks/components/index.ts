/**
 * Component Hooks
 *
 * Hooks for specific UI components that encapsulate component-level logic.
 * These hooks extract business logic from presentational components,
 * making them easier to test and reuse.
 */

export { useMovieCard } from './useMovieCard';
export type {
  UseMovieCardOptions,
  UseMovieCardResult,
  HoverPosition,
} from './useMovieCard';

export { useHeroSection } from './useHeroSection';
export type {
  UseHeroSectionOptions,
  UseHeroSectionResult,
  ProcessedSlideData,
} from './useHeroSection';

export { useMovieFilters } from './useMovieFilters';
export type {
  MovieFilters,
  UseMovieFiltersOptions,
  UseMovieFiltersResult,
} from './useMovieFilters';

export { useRecommendationsSection } from "./useRecommendationsSection";
export type {
  RecommendationItem,
  UseRecommendationsSectionOptions,
  UseRecommendationsSectionResult,
} from "./useRecommendationsSection";

export { useTrendingSuggestions } from "./useTrendingSuggestions";

export { useTVSeriesSections } from "./useTVSeriesSections";

export { useTrailerButton } from "./useTrailerButton";

export { useEpisodePicker } from "./useEpisodePicker";
