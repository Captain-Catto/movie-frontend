import { Star } from "lucide-react";
import { normalizeRatingValue } from "@/utils/rating";

interface RatingBadgeProps {
  rating: number | string | null | undefined;
  /** Display variant */
  variant?: "default" | "badge" | "inline";
  /** Show rating even if it's 0 */
  showZero?: boolean;
  /** Custom className for container */
  className?: string;
}

/**
 * Unified rating display component
 * Reuses normalizeRatingValue from @/utils/rating
 */
export default function RatingBadge({
  rating,
  variant = "default",
  showZero = true,
  className = "",
}: RatingBadgeProps) {
  const normalizedRating = normalizeRatingValue(rating);

  // Don't show if rating is 0 and showZero is false
  if (!showZero && normalizedRating === 0) return null;

  const formattedRating = normalizedRating.toFixed(1);

  // Variant: Badge (yellow background with black text) - for /tv/[id] page
  if (variant === "badge") {
    return (
      <div
        className={`flex items-center bg-yellow-500 text-black px-3 py-1 rounded-full ${className}`}
      >
        <Star className="w-4 h-4 mr-1 fill-current" />
        <span className="font-bold">{formattedRating}</span>
      </div>
    );
  }

  // Variant: Inline (small) - for MovieInfo component
  if (variant === "inline") {
    return (
      <div className={`flex items-center ${className}`}>
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span className="ml-1 text-white">{formattedRating}</span>
      </div>
    );
  }

  // Variant: Default (for MovieCard hover overlay)
  return (
    <span
      className={`bg-yellow-500 text-black px-2 py-1 rounded flex items-center space-x-1 font-bold text-xs ${className}`}
    >
      <Star className="w-3 h-3 fill-current" />
      <span>{formattedRating}</span>
    </span>
  );
}
