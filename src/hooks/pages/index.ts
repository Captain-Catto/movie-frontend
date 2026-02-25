/**
 * Page Hooks
 *
 * High-level hooks that orchestrate entire page logic.
 * Each hook manages all data fetching, state, and interactions for a specific page.
 *
 * These hooks compose multiple data and state hooks to provide
 * a complete page-level solution.
 */

export { useMovieDetailPageClient } from './useMovieDetailPageClient';
export type {
  UseMovieDetailPageClientOptions,
  UseMovieDetailPageClientResult,
} from './useMovieDetailPageClient';

export { useTVDetailPageClient } from './useTVDetailPageClient';
export type {
  UseTVDetailPageClientOptions,
  UseTVDetailPageClientResult,
} from './useTVDetailPageClient';

export { usePersonDetailPageClient } from './usePersonDetailPageClient';
export type {
  PersonDetailTab,
  UsePersonDetailPageClientOptions,
  UsePersonDetailPageClientResult,
} from './usePersonDetailPageClient';

export { useWatchPage } from './useWatchPage';
export type {
  UseWatchPageOptions,
  UseWatchPageResult,
} from './useWatchPage';
