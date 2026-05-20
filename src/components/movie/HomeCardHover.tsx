"use client";

import type { ReactNode } from "react";
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
  const contentType = movie.href?.includes("/tv/") ? "tv" : "movie";
  const poster = movie.posterImage || movie.poster || FALLBACK_POSTER;
  const previewImage = movie.backgroundImage || poster;
  const detailHref = movie.href || `/${contentType}/${movie.tmdbId}`;
  const watchHref = `/watch/${contentType}-${movie.tmdbId}`;

  const handleHoverPosition = (pointerX: number) => {
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
  };

  return (
    <article
      className={`${className} group relative`}
      onMouseEnter={(event) => handleHoverPosition(event.clientX)}
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
