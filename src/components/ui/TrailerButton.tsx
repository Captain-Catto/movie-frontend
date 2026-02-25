"use client";

import { Play, Loader2 } from "lucide-react";
import TrailerModal from "./TrailerModal";
import { useTrailerButton } from "@/hooks/components/useTrailerButton";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const isVietnamese = language.toLowerCase().startsWith("vi");

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
        <span>{isVietnamese ? "Đang kiểm tra trailer..." : "Checking trailer..."}</span>
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
            ? isVietnamese
              ? "Không có trailer"
              : "No trailer available"
            : isVietnamese
            ? "Xem trailer"
            : "Watch trailer"
        }
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
        <span>
          {loading
            ? isVietnamese
              ? "Đang tải..."
              : "Loading..."
            : hasVideos === false
            ? isVietnamese
              ? "Không có trailer"
              : "No trailer available"
            : isVietnamese
            ? "Xem trailer"
            : "Watch Trailer"}
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
