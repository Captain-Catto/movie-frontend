/**
 * Component Hooks
 *
 * Hooks for specific UI components that encapsulate component-level logic.
 * These hooks extract business logic from presentational components,
 * making them easier to test and reuse.
 */

export { useRecommendationsSection } from "./useRecommendationsSection";
export type {
  RecommendationItem,
  UseRecommendationsSectionOptions,
  UseRecommendationsSectionResult,
} from "./useRecommendationsSection";

export { useTrendingSuggestions } from "./useTrendingSuggestions";

export { useTrailerButton } from "./useTrailerButton";

export { useEpisodePicker } from "./useEpisodePicker";

export { useNotificationDropdown } from "./useNotificationDropdown";
export type {
  NotificationItem,
  UseNotificationDropdownResult,
} from "./useNotificationDropdown";

export { useVideoUploader } from "./useVideoUploader";
export { useMovieUploader } from "./useMovieUploader";

export { useCommentForm } from "./useCommentForm";
export type { UseCommentFormResult } from "./useCommentForm";

export { useCommentItem } from "./useCommentItem";
export type { UseCommentItemResult } from "./useCommentItem";
