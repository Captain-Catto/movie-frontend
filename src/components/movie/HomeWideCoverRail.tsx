"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import type { MovieCardData } from "@/types/content.types";
import HomeCardHover from "@/components/movie/HomeCardHover";

interface HomeWideCoverRailProps {
  title: string;
  href: string;
  viewMoreLabel: string;
  movies: MovieCardData[];
}

function WideCoverCard({ movie, priority }: { movie: MovieCardData; priority: boolean }) {
  const cover = movie.backgroundImage || movie.posterImage || movie.poster || FALLBACK_POSTER;
  const poster = movie.posterImage || movie.poster || movie.backgroundImage || FALLBACK_POSTER;
  const score = typeof movie.rating === "number" && movie.rating > 0 ? movie.rating.toFixed(1) : null;
  const duration = movie.duration && movie.duration !== "N/A" ? movie.duration : null;

  return (
    <HomeCardHover movie={movie} className="home-wide-cover-card">
      <Link href={movie.href} className="home-wide-cover-card__cover group" aria-label={movie.title}>
        <Image
          src={cover}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 82vw, (max-width: 1280px) 32vw, 24vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="home-wide-cover-card__cover-shade" />
        <div className="home-wide-cover-card__badges">
          {score && <span>{score}</span>}
          {movie.year && <span>{movie.year}</span>}
        </div>
      </Link>

      <div className="home-wide-cover-card__body">
        <Link href={movie.href} className="home-wide-cover-card__poster" aria-label={movie.title}>
          <Image
            src={poster}
            alt={movie.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </Link>
        <div className="home-wide-cover-card__info">
          <h3 title={movie.title}>
            <Link href={movie.href}>{movie.title}</Link>
          </h3>
          <p title={movie.aliasTitle}>{movie.aliasTitle}</p>
          <div className="home-wide-cover-card__meta">
            {score && <span>{score}</span>}
            {movie.year && <span>{movie.year}</span>}
            {duration && <span>{duration}</span>}
          </div>
        </div>
      </div>
    </HomeCardHover>
  );
}

export default function HomeWideCoverRail({
  title,
  href,
  viewMoreLabel,
  movies,
}: HomeWideCoverRailProps) {
  const titleId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const updateScrollState = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    setCanScrollBack(scroller.scrollLeft > 4);
    setCanScrollNext(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4);
  };

  const scrollByPage = (direction: "prev" | "next") => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction === "next" ? scroller.clientWidth * 0.85 : -scroller.clientWidth * 0.85,
      behavior: "smooth",
    });

    window.setTimeout(updateScrollState, 260);
  };

  useEffect(() => {
    updateScrollState();

    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [movies.length]);

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="home-wide-cover-rail" aria-labelledby={titleId}>
      <div className="home-wide-cover-rail__header">
        <Link href={href} className="home-wide-cover-rail__title-link" aria-label={viewMoreLabel}>
          <h2 id={titleId}>{title}</h2>
          <span>
            <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
        </Link>
      </div>

      <div className="home-wide-cover-rail__content">
        <div className="home-wide-cover-rail__nav" aria-hidden="true">
          <button
            type="button"
            className="home-wide-cover-rail__nav-button"
            onClick={() => scrollByPage("prev")}
            disabled={!canScrollBack}
            tabIndex={-1}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            className="home-wide-cover-rail__nav-button"
            onClick={() => scrollByPage("next")}
            disabled={!canScrollNext}
            tabIndex={-1}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div
          ref={scrollerRef}
          className="home-wide-cover-rail__scroller"
          onScroll={updateScrollState}
        >
          {movies.map((movie, index) => (
            <WideCoverCard
              key={`wide-cover-${movie.id}-${index}`}
              movie={movie}
              priority={index < 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
