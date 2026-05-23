"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import type { MovieCardData } from "@/types/content.types";
import HomeCardHover from "@/components/movie/HomeCardHover";

interface HomePosterRailProps {
  title: string;
  href: string;
  viewMoreLabel: string;
  movies: MovieCardData[];
}

function PosterRailCard({ movie, priority }: { movie: MovieCardData; priority: boolean }) {
  const image = movie.posterImage || movie.poster || movie.backgroundImage || FALLBACK_POSTER;
  const score = typeof movie.rating === "number" && movie.rating > 0 ? movie.rating.toFixed(1) : null;

  return (
    <HomeCardHover movie={movie} className="home-poster-rail-card">
      <Link href={movie.href} className="home-poster-rail-card__thumb group" aria-label={movie.title}>
        <Image
          src={image}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 42vw, (max-width: 1280px) 15vw, 11vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="home-poster-rail-card__shade" />
        <div className="home-poster-rail-card__badges">
          {score && <span>{score}</span>}
          {movie.year && <span>{movie.year}</span>}
        </div>
      </Link>
      <div className="home-poster-rail-card__info">
        <h3 title={movie.title}>
          <Link href={movie.href}>{movie.title}</Link>
        </h3>
        <p title={movie.aliasTitle}>{movie.aliasTitle}</p>
      </div>
    </HomeCardHover>
  );
}

export default function HomePosterRail({
  title,
  href,
  viewMoreLabel,
  movies,
}: HomePosterRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState<boolean | undefined>(undefined);
  const [canScrollNext, setCanScrollNext] = useState<boolean | undefined>(undefined);

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
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const ro = new ResizeObserver(updateScrollState);
    ro.observe(scroller);
    window.addEventListener("resize", updateScrollState);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="home-poster-rail" aria-labelledby="home-upcoming-title">
      <div className="home-poster-rail__header">
        <Link href={href} className="home-poster-rail__title-link" aria-label={viewMoreLabel}>
          <h2 id="home-upcoming-title">{title}</h2>
          <span>
            <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
        </Link>
      </div>

      <div className="home-poster-rail__content">
        <div className="home-poster-rail__nav" aria-hidden="true">
          <button
            type="button"
            className="home-poster-rail__nav-button"
            onClick={() => scrollByPage("prev")}
            disabled={!canScrollBack}
            tabIndex={-1}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="home-poster-rail__nav-button"
            onClick={() => scrollByPage("next")}
            disabled={!canScrollNext}
            tabIndex={-1}
          >
            <ChevronRight size={22} />
          </button>
        </div>
        <div
          ref={scrollerRef}
          className="home-poster-rail__scroller"
          onScroll={updateScrollState}
        >
          {movies.map((movie, index) => (
            <PosterRailCard
              key={`upcoming-${movie.id}`}
              movie={movie}
              priority={index < 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
