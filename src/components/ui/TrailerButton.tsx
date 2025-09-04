"use client";

import { useState } from "react";
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

  const handleWatchTrailer = async () => {
    if (videos.length > 0) {
      setIsModalOpen(true);
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
        // Still open modal to show "no trailers" message
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

  const baseClasses =
    "flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <>
      <button
        onClick={handleWatchTrailer}
        disabled={loading}
        className={combinedClasses}
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
        <span>{loading ? "Đang tải..." : "Xem Trailer"}</span>
      </button>

      <TrailerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videos={videos}
        movieTitle={movieTitle}
      />
    </>
  );
}
