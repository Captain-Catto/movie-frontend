import React from "react";
import Link from "next/link";
import FavoriteButton from "@/components/ui/FavoriteButton";

export interface MovieCardData {
  id: string;
  tmdbId: number;
  title: string;
  aliasTitle: string;
  poster: string;
  href: string;
  episodeNumber?: number;
  totalEpisodes?: number;
  isComplete?: boolean;
  hasSubtitle?: boolean;
  isDubbed?: boolean;
  year?: number;
  rating?: number;
  genre?: string;
  genres?: string[];
  duration?: string;
  description?: string;
}

interface MovieCardProps {
  movie: MovieCardData;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="sw-item group relative">
      {/* Main Card */}
      <Link href={movie.href} className="v-thumbnail block">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 transition-transform duration-300 lg:group-hover:scale-110 lg:group-hover:z-20">
          {/* Favorite Button - Top Right Corner */}
          <FavoriteButton
            item={{ id: movie.id, title: movie.title }}
            size="sm"
            className="!absolute !top-2 !right-2 !bg-black/50 !text-white !opacity-100 lg:!opacity-0 lg:group-hover:!opacity-100 !transition-all !duration-300 group-hover:!text-red-500 hover:!scale-110 !z-10"
          />
          {/* Episode Badge */}
          {movie.episodeNumber && (
            <div className="pin-new m-pin-new">
              <div className="line-center line-pd absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {movie.isComplete ? (
                  <span>Full</span>
                ) : (
                  <span>{movie.episodeNumber}</span>
                )}
              </div>
              {movie.totalEpisodes && (
                <div className="line-center line-lt absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                  <span>{movie.totalEpisodes}</span>
                </div>
              )}
            </div>
          )}

          {/* Movie Special Badges */}
          {movie.isComplete && !movie.episodeNumber && (
            <div className="pin-new m-pin-new">
              <div className="line-center line-pd absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                P.Đề
              </div>
            </div>
          )}

          {/* Language Badges */}
          {movie.isDubbed && (
            <div className="pin-new m-pin-new">
              <div className="line-center line-lt absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                L.Tiếng
              </div>
            </div>
          )}

          {/* Movie Poster */}
          <img
            src={movie.poster}
            alt={`Xem Phim ${movie.title}`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 lg:group-hover:scale-105"
          />

          {/* Mobile/Tablet Hover Overlay - Simple */}
          <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-semibold transition-colors flex items-center justify-center space-x-2">
                <div className="w-4 h-4 relative">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                </div>
                <span>Xem Phim</span>
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Desktop Hover Card - Large Overlay Style */}
      <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-gray-900 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30 transform scale-95 group-hover:scale-100 overflow-hidden">
        {/* Movie Poster - Top Section */}
        <div className="relative h-64">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>

        {/* Content - Bottom Section */}
        <div className="p-6 space-y-4">
          {/* Title Section */}
          <div className="text-center">
            <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
              {movie.title}
            </h3>
            <p className="text-yellow-400 text-xs font-medium">
              {movie.aliasTitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-1.5 rounded font-semibold text-xs transition-colors flex items-center justify-center space-x-1">
              <div className="w-3 h-3 relative">
                <div className="w-0 h-0 border-l-[6px] border-l-black border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5"></div>
              </div>
              <span>Xem ngay</span>
            </button>
            <FavoriteButton
              item={{ id: movie.id, title: movie.title }}
              size="sm"
              className="!w-auto !h-auto px-3 py-1.5 !rounded font-semibold text-xs"
            />
            <Link
              href={movie.href}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded font-semibold text-xs transition-colors flex items-center space-x-1"
            >
              <span>ℹ</span>
              <span>Chi tiết</span>
            </Link>
          </div>

          {/* Movie Info */}
          <div className="space-y-1">
            {/* Year and Episode Info with Rating Badge */}
            <div className="flex items-center space-x-2 text-white text-xs">
              <div className="bg-white text-black px-2 py-1 rounded text-xs font-bold">
                T13
              </div>
              {movie.year && (
                <span className="bg-gray-700 px-2 py-1 rounded">
                  {movie.year}
                </span>
              )}
              {movie.episodeNumber && (
                <>
                  <span className="bg-gray-700 px-2 py-1 rounded">Phần 1</span>
                  <span className="bg-gray-700 px-2 py-1 rounded">
                    Tập {movie.episodeNumber}
                  </span>
                </>
              )}
            </div>

            {/* Genre Tags */}
            <div className="flex flex-wrap items-center space-x-1 text-gray-400 text-xs">
              {movie.genres && movie.genres.length > 0
                ? movie.genres.slice(0, 4).map((genre, index) => (
                    <React.Fragment key={genre}>
                      {index > 0 && <span>•</span>}
                      <span>{genre}</span>
                    </React.Fragment>
                  ))
                : movie.genre && <span>{movie.genre}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info - Always visible */}
      <div className="info mt-3 space-y-1">
        <h4 className="item-title text-white">
          <Link
            href={movie.href}
            title={movie.title}
            className="text-sm font-semibold hover:text-red-500 transition-colors line-clamp-2"
          >
            {movie.title}
          </Link>
        </h4>
        <h4 className="alias-title text-gray-400">
          <Link
            href={movie.href}
            title={movie.aliasTitle}
            className="text-xs hover:text-red-500 transition-colors line-clamp-1"
          >
            {movie.aliasTitle}
          </Link>
        </h4>
      </div>
    </div>
  );
};

export default MovieCard;
