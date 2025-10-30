import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { Play, Info, Star } from "lucide-react";

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
  backgroundImage?: string;
  posterImage?: string;
  scenes?: string[];
}

interface MovieCardProps {
  movie: MovieCardData;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverCardRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<
    "center" | "left" | "right"
  >("center");
  const parsedRating =
    movie.rating === undefined || movie.rating === null
      ? null
      : Number(movie.rating);
  const hasNumericRating =
    typeof parsedRating === "number" && !Number.isNaN(parsedRating);
  const shouldShowRating = hasNumericRating && parsedRating > 0;

  console.log("Rendering MovieCard for:", movie);

  useEffect(() => {
    const handleMouseEnter = () => {
      if (!cardRef.current || !hoverCardRef.current) return;

      const cardRect = cardRef.current.getBoundingClientRect();
      const hoverCardWidth = 384; // w-96 = 384px
      const viewportWidth = window.innerWidth;
      const margin = 20; // Safe margin from edge

      // Calculate where the center of hover card would be
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const hoverCardLeft = cardCenterX - hoverCardWidth / 2;
      const hoverCardRight = cardCenterX + hoverCardWidth / 2;

      // Check if hover card would overflow
      if (hoverCardLeft < margin) {
        // Too close to left edge - align card to left
        setHoverPosition("left");
      } else if (hoverCardRight > viewportWidth - margin) {
        // Too close to right edge - align card to right
        setHoverPosition("right");
      } else {
        // Safe to center
        setHoverPosition("center");
      }
    };

    const cardElement = cardRef.current;
    if (cardElement) {
      cardElement.addEventListener("mouseenter", handleMouseEnter);
      return () =>
        cardElement.removeEventListener("mouseenter", handleMouseEnter);
    }
  }, []);

  const handleWatchMovie = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Determine content type from href, fallback to movie as default
    let contentType = "movie"; // Default to movie
    if (movie.href?.includes("/tv/")) {
      contentType = "tv";
    }

    // Create proper watch URL - tmdbId is guaranteed to exist since all data comes from TMDB
    const watchUrl = `/watch/${contentType}-${movie.tmdbId}`;
    console.log("Navigating to watch page:", watchUrl);
    router.push(watchUrl);
  };

  return (
    <div ref={cardRef} className="sw-item group relative">
      {/* Main Card */}
      <Link
        href={movie.href || `/movie/${movie.tmdbId}`}
        className="v-thumbnail block"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 transition-all duration-300 lg:group-hover:z-20">
          {/* Favorite Button - Top Right Corner */}
          <FavoriteButton
            movie={{
              id: movie.tmdbId,
              title: movie.title,
              poster_path: movie.poster,
              vote_average: movie.rating,
              media_type: movie.href?.includes("/tv/") ? "tv" : "movie", // ✅ Add media_type
              overview: movie.description,
              genres:
                movie.genres?.map((genre) => ({ id: 0, name: genre })) || [],
            }}
            iconOnly={true}
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

          {/* Movie Poster */}
          <Image
            src={
              movie.poster ||
              ("posterUrl" in movie ? (movie as Record<string, string>).posterUrl : "") ||
              "/images/no-poster.svg"
            }
            alt={`Xem Phim ${movie.title}`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
            loading="lazy"
            className="object-cover transition-transform duration-300"
          />

          {/* Mobile/Tablet Hover Overlay - Simple */}
          <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <button
                onClick={handleWatchMovie}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-semibold transition-colors flex items-center justify-center space-x-2"
              >
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
      <div
        ref={hoverCardRef}
        className={`hidden lg:block absolute top-1/2 -translate-y-1/2 w-96 bg-gray-900 rounded-xl shadow-2xl opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto transition-all duration-300 z-30 transform scale-95 group-hover:scale-100 overflow-hidden ${
          hoverPosition === "left"
            ? "left-0 translate-x-0"
            : hoverPosition === "right"
            ? "right-0 translate-x-0"
            : "left-1/2 -translate-x-1/2"
        }`}
      >
        {/* Movie Poster - Top Section */}
        <div className="relative h-64">
          <Image
            src={
              movie.backgroundImage ||
              movie.poster ||
              movie.posterImage ||
              "/images/no-poster.svg"
            }
            alt={movie.title}
            fill
            sizes="384px"
            className="object-cover"
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
            <button
              onClick={handleWatchMovie}
              className="flex-1 bg-red-400 hover:bg-red-500 text-white py-1.5 rounded font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Xem ngay</span>
            </button>
            <FavoriteButton
              movie={{
                id: movie.tmdbId,
                title: movie.title,
                poster_path: movie.poster,
                vote_average: movie.rating,
                media_type: movie.href?.includes("/tv/") ? "tv" : "movie", // ✅ Add media_type
                overview: movie.description,
                genres:
                  movie.genres?.map((genre) => ({ id: 0, name: genre })) || [],
              }}
              className="!w-auto !h-auto px-3 py-1.5 !rounded font-semibold text-xs"
            />
            <Link
              href={movie.href || `/movie/${movie.tmdbId}`}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded font-semibold text-xs transition-colors flex items-center space-x-1"
            >
              <Info className="w-4 h-4" />
              <span>Chi tiết</span>
            </Link>
          </div>

          {/* Movie Info */}
          <div className="space-y-1">
            {/* Rating, Year and Genres - All in one row */}
            <div className="flex flex-wrap gap-1 items-center">
              {shouldShowRating && (
                <span className="bg-yellow-500 text-black px-2 py-1 rounded flex items-center space-x-1 font-bold text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{parsedRating}</span>
                </span>
              )}
              {movie.year && (
                <span className="bg-gray-700 text-white px-2 py-1 rounded font-medium text-xs">
                  {movie.year}
                </span>
              )}
              {movie.genres && movie.genres.length > 0
                ? movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium"
                    >
                      {genre}
                    </span>
                  ))
                : movie.genre && (
                    <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium">
                      {movie.genre}
                    </span>
                  )}
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info - Always visible */}
      <div className="info mt-3 space-y-1">
        <h4 className="item-title text-white">
          <Link
            href={movie.href || `/movie/${movie.tmdbId}`}
            title={movie.title}
            className="text-sm font-semibold hover:text-red-500 transition-colors line-clamp-2"
          >
            {movie.title}
          </Link>
        </h4>
        <h4 className="alias-title text-gray-400">
          <Link
            href={movie.href || `/movie/${movie.tmdbId}`}
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
