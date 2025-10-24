"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchResult } from "@/types/search";
import { Calendar, Star, Film, Tv } from "lucide-react";

interface SearchResultItemProps {
  result: SearchResult;
  onClose: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  onClose,
}) => {
  const releaseDate = result.releaseDate || result.firstAirDate;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const handleClick = () => {
    onClose();
  };

  const getMediaTypeInfo = () => {
    if (result.mediaType === "tv") {
      return {
        icon: Tv,
        label: "Phim bộ",
        href: `/tv/${result.tmdbId}`,
        color: "text-green-400",
      };
    }
    return {
      icon: Film,
      label: "Phim lẻ",
      href: `/movie/${result.tmdbId}`,
      color: "text-blue-400",
    };
  };

  const mediaInfo = getMediaTypeInfo();
  const MediaIcon = mediaInfo.icon;

  return (
    <Link
      href={mediaInfo.href}
      onClick={handleClick}
      className="flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
    >
      {/* Poster */}
      <div className="relative w-12 h-16 flex-shrink-0">
        <Image
          src={
            result.posterPath
              ? `https://image.tmdb.org/t/p/w185${result.posterPath}`
              : "/images/no-poster.svg"
          }
          alt={result.title}
          width={48}
          height={64}
          className="w-full h-full object-cover rounded"
        />

        {/* Media type badge */}
        <div
          className={`absolute -top-1 -right-1 p-1 bg-gray-900 rounded-full ${mediaInfo.color}`}
        >
          <MediaIcon className="w-3 h-3" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium line-clamp-1 group-hover:text-red-400 transition-colors">
          {result.title}
        </h3>

        {result.originalTitle && result.originalTitle !== result.title && (
          <p className="text-gray-400 text-sm line-clamp-1">
            {result.originalTitle}
          </p>
        )}

        <div className="flex items-center space-x-3 mt-1">
          {/* Media type */}
          <span className={`text-xs ${mediaInfo.color}`}>
            {mediaInfo.label}
          </span>

          {/* Year */}
          {year && (
            <div className="flex items-center space-x-1 text-gray-400">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{year}</span>
            </div>
          )}

          {/* Rating */}
          {result.voteAverage && Number(result.voteAverage) > 0 && (
            <div className="flex items-center space-x-1 text-yellow-400">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs">
                {Number(result.voteAverage).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Overview */}
        {result.overview && (
          <p className="text-gray-500 text-xs line-clamp-2 mt-1">
            {result.overview}
          </p>
        )}
      </div>
    </Link>
  );
};

export default SearchResultItem;
