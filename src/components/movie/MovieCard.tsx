"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { HoverPreviewCard } from "@/components/movie/HoverPreviewCard";
import { FALLBACK_POSTER, TMDB_IMAGE_BASE_URL, TMDB_POSTER_SIZE } from "@/constants/app.constants";
import { tmdbImageLoader } from "@/lib/tmdb-image-loader";

async function fetchFallbackPoster(tmdbId: number, type: string): Promise<string | null> {
  try {
    const r = await fetch(`/api/poster/${tmdbId}?type=${type}`);
    const res = await r.json();
    if (res.data?.posterPath) return `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${res.data.posterPath}`;
    return null;
  } catch {
    return null;
  }
}
import type { MovieCardData } from "@/types/content.types";
import { analyticsService } from "@/services/analytics.service";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMovieCardUiMessages } from "@/lib/ui-messages";

interface MovieCardProps {
  movie: MovieCardData;
  priority?: boolean;
}

const MovieCard = ({ movie, priority = false }: MovieCardProps) => {
  const { push } = useRouter();
  const { language } = useLanguage();
  const labels = getMovieCardUiMessages(language);
  const [hoverPosition, setHoverPosition] = useState<"center" | "left" | "right">("center");

  // Detect content type from href to create proper fallback
  const isTVSeries = movie.href?.includes("/tv/");
  const contentTypePrefix = isTVSeries ? "tv" : "movie";
  const detailHref = movie.href || `/${contentTypePrefix}/${movie.tmdbId}`;
  const initialPoster =
    movie.poster ||
    ("posterUrl" in movie
      ? (movie as Record<string, string | undefined>).posterUrl
      : undefined) ||
    FALLBACK_POSTER;

  const [posterSafe, setPosterSafe] = useState(initialPoster);

  useEffect(() => {
    if (initialPoster !== FALLBACK_POSTER || !movie.tmdbId) return;
    const type = isTVSeries ? "tv" : "movie";
    fetchFallbackPoster(movie.tmdbId, type).then((url) => {
      if (url) setPosterSafe(url);
    });
  }, [movie.tmdbId, initialPoster, isTVSeries]);

  const handleHoverPosition = useCallback((pointerX: number) => {
    if (typeof window === "undefined") return;
    const viewportWidth = window.innerWidth;
    const hoverCardWidth = 384;
    const margin = 20;
    const hoverCardLeft = pointerX - hoverCardWidth / 2;
    const hoverCardRight = pointerX + hoverCardWidth / 2;
    if (hoverCardLeft < margin) {
      setHoverPosition("left");
    } else if (hoverCardRight > viewportWidth - margin) {
      setHoverPosition("right");
    } else {
      setHoverPosition("center");
    }
  }, []);

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
    push(watchUrl);
  };

  return (
    <div
      className="sw-item group relative"
      onMouseEnter={(event) => handleHoverPosition(event.clientX)}
    >
      <div className="relative">
        {/* Main Card */}
        <Link
          href={detailHref}
          className="v-thumbnail block min-h-12 min-w-12 rounded-lg"
          onClick={handleCardClick}
        >
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 transition-all duration-300 lg:group-hover:z-20">
            {/* Movie Poster */}
            <Image
              src={posterSafe}
              alt={labels.watchNowAlt(movie.title)}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16.67vw, 12.5vw"
              priority={priority}
              loading={priority ? undefined : "lazy"}
              loader={posterSafe.includes("image.tmdb.org") ? tmdbImageLoader : undefined}
              className="object-cover transition-transform duration-300"
            />

            {/* Episode Badge — rendered after Image so it appears on top */}
            {movie.episodeNumber && (
              <>
                <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {movie.isComplete ? <span>{labels.full}</span> : <span>{movie.episodeNumber} {labels.episodePrefix}</span>}
                </div>
                {movie.totalEpisodes && (
                  <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {movie.totalEpisodes} {labels.episodePrefix}
                  </div>
                )}
              </>
            )}

            {/* Mobile/Tablet Hover Overlay - Simple */}
            <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <button
                  type="button"
                  onClick={handleWatchMovie}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-semibold transition-colors flex items-center justify-center gap-x-2 cursor-pointer"
                >
                  <div className="size-4 relative">
                    <div className="size-0 border-l-[8px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                  </div>
                  <span>{labels.watch}</span>
                </button>
              </div>
            </div>
          </div>
        </Link>

        {/* Favorite Button — mobile only, desktop uses the one inside HoverPreviewCard */}
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
          className="!absolute !top-3 !right-3 !bg-black/50 !text-white !z-20 lg:!hidden [data-state=on]:!bg-red-500 [data-state=on]:hover:!bg-red-600 [data-state=on]:!text-white"
          activeClassName="!bg-red-500 !text-white hover:!bg-red-600"
        />
      </div>

      {/* Desktop Hover Card — always in DOM, CSS group-hover handles visibility */}
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

      {/* Movie Info - Always visible */}
      <div className="info mt-3 gap-y-1">
        <p
          className="item-title block min-h-12 min-w-12 p-2 text-center text-sm font-semibold leading-5 text-white line-clamp-3"
          title={movie.title}
        >
          {movie.title}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
