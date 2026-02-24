"use client";

import { useState, useEffect } from "react";
import { X, Play } from "lucide-react";
import { Video } from "@/types/content.types";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: Video[];
  movieTitle: string;
}

export default function TrailerModal({
  isOpen,
  onClose,
  videos,
  movieTitle,
}: TrailerModalProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Find the best trailer - prefer official trailers
  useEffect(() => {
    if (videos.length > 0 && !selectedVideo) {
      // Priority: Official trailers > Trailers > Teasers > Other videos
      const officialTrailer = videos.find(
        (v) => v.official && v.type === "Trailer" && v.site === "YouTube"
      );
      const trailer = videos.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      );
      const teaser = videos.find(
        (v) => v.type === "Teaser" && v.site === "YouTube"
      );
      const anyVideo = videos.find((v) => v.site === "YouTube");

      setSelectedVideo(
        officialTrailer || trailer || teaser || anyVideo || null
      );
    }
  }, [videos, selectedVideo]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        // Restore original overflow value instead of unset
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const youtubeVideos = videos.filter((v) => v.site === "YouTube");

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-lg max-w-7xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">{movieTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Content - Two Columns Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video Player - Left Side */}
          <div className="flex-1">
            {selectedVideo ? (
              <div className="relative aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0&modestbranding=1`}
                  title={selectedVideo.name}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-800">
                <p className="text-gray-400">Select a video to play</p>
              </div>
            )}
          </div>

          {/* Video List - Right Side */}
          {youtubeVideos.length > 0 && (
            <div className="w-80 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <h3 className="text-white font-semibold">Video List</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {youtubeVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedVideo?.id === video.id
                        ? "border-blue-500 bg-blue-500/20 text-white"
                        : "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    } cursor-pointer`}
                  >
                    <div className="flex items-center space-x-3">
                      <Play size={16} className="text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {video.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {video.type} • {video.official ? "Official" : "Fan"} •{" "}
                          {video.size}p
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* No Videos Message */}
        {youtubeVideos.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">No trailers available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
