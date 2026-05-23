"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
} from "@/constants/app.constants";

interface ContentHoverPreviewProps {
  title: string;
  posterUrl?: string;
  posterPath?: string;
  voteAverage?: number;
  year?: string;
  overview?: string;
  contentType?: string;
  children: React.ReactNode;
}

const toTmdbPosterUrl = (value: string | null | undefined): string | null => {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${value}`;
  return value;
};

export function ContentHoverPreview({
  title,
  posterUrl,
  posterPath,
  voteAverage,
  overview,
  contentType,
  children,
}: ContentHoverPreviewProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const numericVoteAverage = Number(voteAverage);
  const hasRating = Number.isFinite(numericVoteAverage) && numericVoteAverage > 0;

  const imageUrl = toTmdbPosterUrl(posterUrl) ?? toTmdbPosterUrl(posterPath);

  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {visible && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden pointer-events-none">
          <div className="flex gap-3 p-3">
            {/* Poster */}
            {imageUrl ? (
              <div className="relative w-20 h-28 rounded overflow-hidden shrink-0">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-28 rounded bg-gray-800 shrink-0 flex items-center justify-center">
                <span className="text-gray-600 text-xs">No image</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <h4 className="text-white text-sm font-semibold line-clamp-2">
                {title}
              </h4>

              <div className="flex items-center gap-2">
                {hasRating && (
                  <span className="flex items-center gap-0.5 text-yellow-400 text-xs font-semibold">
                    <Star className="size-3" />
                    {numericVoteAverage.toFixed(1)}
                  </span>
                )}
                {contentType && (
                  <span className="text-blue-400 text-xs capitalize">
                    {contentType === "tv_series" ? "TV" : contentType}
                  </span>
                )}
              </div>

              {overview && (
                <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">
                  {overview}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
