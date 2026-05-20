"use client";

import type { ReactNode } from "react";
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
  const contentType = movie.href?.includes("/tv/") ? "tv" : "movie";
  const poster = movie.posterImage || movie.poster || FALLBACK_POSTER;
  const previewImage = movie.backgroundImage || poster;
  const detailHref = movie.href || `/${contentType}/${movie.tmdbId}`;
  const watchHref = `/watch/${contentType}-${movie.tmdbId}`;

  return (
    <article className={`${className} group relative`}>
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
        placement="center"
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
