/**
 * Page Hooks
 *
 * High-level hooks that orchestrate entire page logic.
 * Each hook manages all data fetching, state, and interactions for a specific page.
 *
 * These hooks compose multiple data and state hooks to provide
 * a complete page-level solution.
 */

export { useHomePage } from './useHomePage';
export type { UseHomePageResult, HomePageSections, MovieSection } from './useHomePage';

export { useBrowsePage } from './useBrowsePage';
export type {
  UseBrowsePageResult,
  BrowseFilters,
  BrowseContentType,
} from './useBrowsePage';

export { useMovieDetailPage } from './useMovieDetailPage';
export type {
  UseMovieDetailPageOptions,
  UseMovieDetailPageResult,
  ProcessedDetailData,
} from './useMovieDetailPage';

export { useFavoritesPage } from './useFavoritesPage';
export type {
  UseFavoritesPageOptions,
  UseFavoritesPageResult,
  FavoritesContentType,
} from './useFavoritesPage';
