"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { HoverPreviewCard } from "@/components/movie/HoverPreviewCard";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import type { MovieCardData } from "@/types/content.types";
import { analyticsService } from "@/services/analytics.service";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMovieCardUiMessages } from "@/lib/ui-messages";

interface MovieCardProps {
  movie: MovieCardData;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const router = useRouter();
  const { language } = useLanguage();
  const labels = getMovieCardUiMessages(language);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<
    "center" | "left" | "right"
  >("center");

  // Detect content type from href to create proper fallback
  const isTVSeries = movie.href?.includes("/tv/");
  const contentTypePrefix = isTVSeries ? "tv" : "movie";
  const detailHref = movie.href || `/${contentTypePrefix}/${movie.tmdbId}`;
  const posterSafe =
    movie.poster ||
    ("posterUrl" in movie
      ? (movie as Record<string, string | undefined>).posterUrl
      : undefined) ||
    FALLBACK_POSTER;

  const handleHoverPosition = (pointerX: number) => {
    if (typeof window === "undefined") return;

    const viewportWidth = window.innerWidth;
    const hoverCardWidth = 384; // w-96 = 384px
    const margin = 20; // Safe margin from edge

    const hoverCardLeft = pointerX - hoverCardWidth / 2;
    const hoverCardRight = pointerX + hoverCardWidth / 2;

    // Check if hover card would overflow
    if (hoverCardLeft < margin) {
      setHoverPosition("left");
    } else if (hoverCardRight > viewportWidth - margin) {
      setHoverPosition("right");
    } else {
      setHoverPosition("center");
    }
  };

  const handleCardClick = () => {
    // Track CLICK event when user clicks on card
    const contentType = isTVSeries ? "tv_series" : "movie";
    analyticsService.trackClick(
      String(movie.tmdbId),
      contentType,
      movie.title
    );
  };

  const handleWatchMovie = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Determine content type from href, fallback to movie as default
    let contentType = "movie"; // Default to movie
    if (movie.href?.includes("/tv/")) {
      contentType = "tv";
    }

    // Track PLAY event
    const analyticsContentType = contentType === "tv" ? "tv_series" : "movie";
    analyticsService.trackPlay(
      String(movie.tmdbId),
      analyticsContentType,
      movie.title,
      { source: "card_watch_button", context: "card" }
    );

    // Create proper watch URL - tmdbId is guaranteed to exist since all data comes from TMDB
    const watchUrl = `/watch/${contentType}-${movie.tmdbId}`;
    router.push(watchUrl);
  };

  return (
    <div
      className="sw-item group relative"
      onMouseEnter={(event) => {
        setIsHovered(true);
        handleHoverPosition(event.clientX);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Main Card */}
        <Link
          href={detailHref}
          className="v-thumbnail block min-h-12 min-w-12 rounded-lg"
          onClick={handleCardClick}
        >
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 transition-all duration-300 lg:group-hover:z-20">
            {/* Episode Badge */}
            {movie.episodeNumber && (
              <div className="pin-new m-pin-new">
                <div className="line-center line-pd absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {movie.isComplete ? (
                    <span>{labels.full}</span>
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
              src={posterSafe}
              alt={labels.watchNowAlt(movie.title)}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16.67vw, 12.5vw"
              loading="lazy"
              quality={55}
              className="object-cover transition-transform duration-300"
            />

            {/* Mobile/Tablet Hover Overlay - Simple */}
            <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <button
                  onClick={handleWatchMovie}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <div className="w-4 h-4 relative">
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                  </div>
                  <span>{labels.watch}</span>
                </button>
              </div>
            </div>
          </div>
        </Link>

        {/* Favorite Button - keep separate from link to avoid nested interactive elements */}
        <FavoriteButton
          movie={{
            id: movie.tmdbId,
            title: movie.title,
            poster_path: posterSafe,
            vote_average: movie.rating,
            media_type: movie.href?.includes("/tv/") ? "tv" : "movie",
            overview: movie.description,
            genres:
              movie.genres?.map((genre) => ({ id: 0, name: genre })) || [],
          }}
          iconOnly={true}
          className="!absolute !top-3 !right-3 !bg-black/50 !text-white !opacity-100 lg:!opacity-0 lg:group-hover:!opacity-100 !transition-all !duration-300 group-hover:!text-red-500 hover:!scale-110 !z-20 [data-state=on]:!bg-red-500 [data-state=on]:hover:!bg-red-600 [data-state=on]:!text-white [data-state=on]:lg:!opacity-100"
          activeClassName="!bg-red-500 !text-white hover:!bg-red-600 !opacity-100"
        />
      </div>

      {/* Desktop Hover Card - Large Overlay Style */}
      {isHovered ? (
        <HoverPreviewCard
          title={movie.title}
          subtitle={movie.aliasTitle}
          image={
            movie.backgroundImage ||
            movie.posterImage ||
            posterSafe ||
            FALLBACK_POSTER
          }
          watchHref={`/watch/${contentTypePrefix}-${movie.tmdbId}`}
          detailHref={detailHref}
          rating={movie.rating}
          year={movie.year}
          overview={movie.description}
          contentType={contentTypePrefix === "tv" ? "tv" : "movie"}
          contentId={movie.tmdbId}
          placement={hoverPosition}
          genreIds={movie.genreIds}
          genreNames={movie.genres}
          favoriteButton={{
            id: movie.tmdbId,
            tmdbId: movie.tmdbId,
            title: movie.title,
            poster_path: posterSafe,
            vote_average: movie.rating,
            media_type: contentTypePrefix === "tv" ? "tv" : "movie",
            overview: movie.description,
            genres: movie.genres?.map((genre) => ({ id: 0, name: genre })) || [],
          }}
          className="hidden lg:block"
        />
      ) : null}

      {/* Movie Info - Always visible */}
      <div className="info mt-3 space-y-1">
        <p
          className="item-title block min-h-12 min-w-12 px-2 py-2 text-center text-sm font-semibold leading-5 text-white line-clamp-3"
          title={movie.title}
        >
          {movie.title}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
