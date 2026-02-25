"use client";

import { Play, Loader2 } from "lucide-react";
import TrailerModal from "./TrailerModal";
import { useTrailerButton } from "@/hooks/components/useTrailerButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTrailerButtonUiMessages } from "@/lib/ui-messages";

interface TrailerButtonProps {
  movieId: number;
  movieTitle: string;
  contentType?: "movie" | "tv";
  className?: string;
}

export default function TrailerButton({
  movieId,
  movieTitle,
  contentType = "movie",
  className = "",
}: TrailerButtonProps) {
  const { language } = useLanguage();
  const labels = getTrailerButtonUiMessages(language);

  const {
    isModalOpen,
    videos,
    loading,
    hasVideos,
    initialCheckDone,
    openTrailer,
    closeTrailer,
  } = useTrailerButton({ movieId, contentType });

  const isDisabled = loading || hasVideos === false;
  const baseClasses =
    "flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200";

  const buttonClasses = isDisabled
    ? `${baseClasses} bg-gray-600 text-gray-400 cursor-not-allowed opacity-50`
    : `${baseClasses} bg-red-600 hover:bg-red-700 text-white cursor-pointer`;

  const combinedClasses = `${buttonClasses} ${className}`;

  // Show loading state during initial check
  if (!initialCheckDone) {
    return (
      <button disabled className={combinedClasses}>
        <Loader2 size={20} className="animate-spin" />
        <span>{labels.checkingTrailer}</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => void openTrailer()}
        disabled={isDisabled}
        className={combinedClasses}
        title={
          hasVideos === false
            ? labels.noTrailerAvailable
            : labels.watchTrailer
        }
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
        <span>
          {loading
            ? labels.loading
            : hasVideos === false
            ? labels.noTrailerAvailable
            : labels.watchTrailer}
        </span>
      </button>

      {hasVideos && (
        <TrailerModal
          isOpen={isModalOpen}
          onClose={closeTrailer}
          videos={videos}
          movieTitle={movieTitle}
        />
      )}
    </>
  );
}
