"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import type { MovieCardData } from "@/types/content.types";
import HomeCardHover from "@/components/movie/HomeCardHover";

interface HomeTopicRow {
  title: string;
  href: string;
  viewMoreLabel: string;
  movies: MovieCardData[];
  accentClassName?: string;
}

interface HomeTopicRowsProps {
  rows: HomeTopicRow[];
}

function HomeTopicCard({ movie, priority }: { movie: MovieCardData; priority: boolean }) {
  const image = movie.posterImage || movie.poster || movie.backgroundImage || FALLBACK_POSTER;
  const score = typeof movie.rating === "number" && movie.rating > 0 ? movie.rating.toFixed(1) : null;

  return (
    <HomeCardHover movie={movie} className="home-topic-card">
      <Link href={movie.href} className="home-topic-card__thumb" aria-label={movie.title}>
        <Image
          src={image}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 42vw, (max-width: 1280px) 16vw, 12vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="home-topic-card__shade" />
        <div className="home-topic-card__badges">
          {score && <span>{score}</span>}
          {movie.year && <span>{movie.year}</span>}
        </div>
      </Link>
      <div className="home-topic-card__info">
        <h3 title={movie.title}>
          <Link href={movie.href}>{movie.title}</Link>
        </h3>
        <p title={movie.aliasTitle}>{movie.aliasTitle}</p>
      </div>
    </HomeCardHover>
  );
}

function HomeTopicRowItem({ row, rowIndex }: { row: HomeTopicRow; rowIndex: number }) {
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
  }, [row.movies.length]);

  if (row.movies.length === 0) {
    return null;
  }

  return (
    <section className="home-topic-row" aria-labelledby={`home-topic-row-${rowIndex}`}>
      <div className="home-topic-row__intro">
        <h2 id={`home-topic-row-${rowIndex}`} className={row.accentClassName}>
          {row.title}
        </h2>
        <Link href={row.href} className="home-topic-row__view-all">
          <span>{row.viewMoreLabel}</span>
          <ChevronRight aria-hidden="true" size={16} strokeWidth={2.4} />
        </Link>
      </div>

      <div className="home-topic-row__content">
        <div className="home-topic-row__nav" aria-hidden="true">
          <button
            type="button"
            className="home-topic-row__nav-button"
            onClick={() => scrollByPage("prev")}
            disabled={!canScrollBack}
            tabIndex={-1}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="home-topic-row__nav-button"
            onClick={() => scrollByPage("next")}
            disabled={!canScrollNext}
            tabIndex={-1}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div
          ref={scrollerRef}
          className="home-topic-row__scroller"
          onScroll={updateScrollState}
        >
          {row.movies.map((movie, index) => (
            <HomeTopicCard
              key={`${row.href}-${movie.id}`}
              movie={movie}
              priority={rowIndex === 0 && index < 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeTopicRows({ rows }: HomeTopicRowsProps) {
  return (
    <div className="home-topic-rows">
      {rows.map((row, index) => (
        <HomeTopicRowItem key={row.href} row={row} rowIndex={index} />
      ))}
    </div>
  );
}
