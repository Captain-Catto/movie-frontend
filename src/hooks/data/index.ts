/**
 * Data fetching hooks
 * These hooks handle API calls and data transformation
 */

export { useMoviesList } from './useMoviesList';
export type {
  UseMoviesListOptions,
  UseMoviesListResult,
  MovieCategory,
  PaginationMeta,
} from './useMoviesList';

export { useTVSeriesList } from './useTVSeriesList';
export type {
  UseTVSeriesListOptions,
  UseTVSeriesListResult,
  TVSeriesCategory,
} from './useTVSeriesList';

export { useContentDetail } from './useContentDetail';
export type {
  UseContentDetailOptions,
  UseContentDetailResult,
  ContentDetailData,
  VideoData,
} from './useContentDetail';
