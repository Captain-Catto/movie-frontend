"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { HoverPreviewCard } from "@/components/movie/HoverPreviewCard";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import type { MovieCardData } from "@/types/content.types";

interface HomeCardHoverProps {
  movie: MovieCardData;
  className: string;
  children: ReactNode;
}

export default function HomeCardHover({
  movie,
  className,
  children,
}: HomeCardHoverProps) {
  const [hoverPosition, setHoverPosition] = useState<"center" | "left" | "right">("center");
  const [floatingStyle, setFloatingStyle] = useState<CSSProperties>();
  const contentType = movie.href?.includes("/tv/") ? "tv" : "movie";
  const poster = movie.posterImage || movie.poster || FALLBACK_POSTER;
  const previewImage = movie.backgroundImage || poster;
  const detailHref = movie.href || `/${contentType}/${movie.tmdbId}`;
  const watchHref = `/watch/${contentType}-${movie.tmdbId}`;

  const handleHoverPosition = (target: HTMLElement) => {
    if (typeof window === "undefined") return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const hoverCardWidth = 384;
    const hoverCardHeight = 430;
    const margin = 20;
    const rect = target.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const hoverCardLeft = cardCenterX - hoverCardWidth / 2;
    const hoverCardRight = cardCenterX + hoverCardWidth / 2;
    const top = Math.min(
      Math.max(rect.top + rect.height / 2 - hoverCardHeight / 2, margin),
      Math.max(viewportHeight - hoverCardHeight - margin, margin)
    );

    if (hoverCardLeft < margin) {
      setHoverPosition("left");
      setFloatingStyle({ left: margin, top });
    } else if (hoverCardRight > viewportWidth - margin) {
      setHoverPosition("right");
      setFloatingStyle({ left: viewportWidth - hoverCardWidth - margin, top });
    } else {
      setHoverPosition("center");
      setFloatingStyle({ left: hoverCardLeft, top });
    }
  };

  return (
    <article
      className={`${className} group relative`}
      onMouseEnter={(event) => handleHoverPosition(event.currentTarget)}
    >
      {children}
      <HoverPreviewCard
        title={movie.title}
        subtitle={movie.aliasTitle}
        image={previewImage}
        watchHref={watchHref}
        detailHref={detailHref}
        rating={movie.rating}
        year={movie.year}
        overview={movie.description}
        contentType={contentType}
        contentId={movie.tmdbId}
        placement={hoverPosition}
        floatingStyle={floatingStyle}
        genreIds={movie.genreIds}
        genreNames={movie.genres}
        favoriteButton={{
          id: movie.tmdbId,
          tmdbId: movie.tmdbId,
          title: movie.title,
          poster_path: poster,
          vote_average: movie.rating,
          media_type: contentType,
          overview: movie.description,
          genres: movie.genres?.map((genre) => ({ id: 0, name: genre })) || [],
        }}
        className="hidden lg:block"
      />
    </article>
  );
}
