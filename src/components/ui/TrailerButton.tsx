"use client";

import { useState, useEffect } from "react";
import { Play, Loader2 } from "lucide-react";
import TrailerModal from "./TrailerModal";
import { apiService } from "@/services/api";
import { Video } from "@/types/movie";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVideos, setHasVideos] = useState<boolean | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check if videos are available on component mount
  useEffect(() => {
    const checkVideosAvailability = async () => {
      setLoading(true);
      try {
        let response;
        if (contentType === "tv") {
          response = await apiService.getTVVideos(movieId);
        } else {
          response = await apiService.getMovieVideos(movieId);
        }

        if (response.success && response.data?.results) {
          const availableVideos = response.data.results;
          setVideos(availableVideos);
          setHasVideos(availableVideos.length > 0);
        } else {
          setHasVideos(false);
          setVideos([]);
        }
      } catch (err) {
        console.error("Error checking videos availability:", err);
        setHasVideos(false);
        setVideos([]);
      } finally {
        setLoading(false);
        setInitialCheckDone(true);
      }
    };

    if (movieId) {
      checkVideosAvailability();
    }
  }, [movieId, contentType]);

  const handleWatchTrailer = async () => {
    if (videos.length > 0) {
      setIsModalOpen(true);
      return;
    }

    // If no videos available, don't do anything
    if (hasVideos === false) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (contentType === "tv") {
        response = await apiService.getTVVideos(movieId);
      } else {
        response = await apiService.getMovieVideos(movieId);
      }

      if (response.success && response.data?.results) {
        setVideos(response.data.results);
        setIsModalOpen(true);
      } else {
        setError("Không có trailer khả dụng");
        setVideos([]);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Không thể tải trailer");
      setVideos([]);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || hasVideos === false;
  const baseClasses =
    "flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200";

  const buttonClasses = isDisabled
    ? `${baseClasses} bg-gray-600 text-gray-400 cursor-not-allowed opacity-50`
    : `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;

  const combinedClasses = `${buttonClasses} ${className}`;

  // Show loading state during initial check
  if (!initialCheckDone) {
    return (
      <button disabled className={combinedClasses}>
        <Loader2 size={20} className="animate-spin" />
        <span>Kiểm tra trailer...</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleWatchTrailer}
        disabled={isDisabled}
        className={combinedClasses}
        title={
          hasVideos === false ? "Không có trailer khả dụng" : "Xem trailer"
        }
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
        <span>
          {loading
            ? "Đang tải..."
            : hasVideos === false
            ? "Không có trailer"
            : "Xem Trailer"}
        </span>
      </button>

      {hasVideos && (
        <TrailerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videos={videos}
          movieTitle={movieTitle}
        />
      )}
    </>
  );
}
