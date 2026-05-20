"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import type { MovieCardData } from "@/types/content.types";

interface HomeTopTenRailProps {
  title: string;
  movies: MovieCardData[];
}

function TopTenCard({
  movie,
  index,
  priority,
}: {
  movie: MovieCardData;
  index: number;
  priority: boolean;
}) {
  const image = movie.posterImage || movie.poster || movie.backgroundImage || FALLBACK_POSTER;
  const score = typeof movie.rating === "number" && movie.rating > 0 ? movie.rating.toFixed(1) : null;
  const duration = movie.duration && movie.duration !== "N/A" ? movie.duration : null;

  return (
    <article className="home-top-ten-card">
      <Link href={movie.href} className="home-top-ten-card__thumb group" aria-label={movie.title}>
        <Image
          src={image}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 72vw, (max-width: 1280px) 22vw, 16vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="home-top-ten-card__mask" />
        <div className="home-top-ten-card__badges">
          {score && <span>{score}</span>}
          {movie.year && <span>{movie.year}</span>}
        </div>
      </Link>
      <div className="home-top-ten-card__info">
        <div className="home-top-ten-card__rank">{index + 1}</div>
        <div className="home-top-ten-card__text">
          <h3 title={movie.title}>
            <Link href={movie.href}>{movie.title}</Link>
          </h3>
          <p title={movie.aliasTitle}>{movie.aliasTitle}</p>
          <div className="home-top-ten-card__meta">
            {score && <span>{score}</span>}
            {movie.year && <span>{movie.year}</span>}
            {duration && <span>{duration}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomeTopTenRail({ title, movies }: HomeTopTenRailProps) {
  const topMovies = movies.slice(0, 10);
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
      left: direction === "next" ? scroller.clientWidth * 0.8 : -scroller.clientWidth * 0.8,
      behavior: "smooth",
    });

    window.setTimeout(updateScrollState, 260);
  };

  useEffect(() => {
    updateScrollState();

    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [topMovies.length]);

  if (topMovies.length === 0) {
    return null;
  }

  return (
    <section className="home-top-ten" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>

      <div className="home-top-ten__content">
        <div className="home-top-ten__nav" aria-hidden="true">
          <button
            type="button"
            className="home-top-ten__nav-button"
            onClick={() => scrollByPage("prev")}
            disabled={!canScrollBack}
            tabIndex={-1}
          >
            <ChevronLeft size={26} />
          </button>
          <button
            type="button"
            className="home-top-ten__nav-button"
            onClick={() => scrollByPage("next")}
            disabled={!canScrollNext}
            tabIndex={-1}
          >
            <ChevronRight size={26} />
          </button>
        </div>
        <div ref={scrollerRef} className="home-top-ten__scroller" onScroll={updateScrollState}>
          {topMovies.map((movie, index) => (
            <TopTenCard
              key={`top-ten-${movie.id}-${index}`}
              movie={movie}
              index={index}
              priority={index < 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
