"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Info, Play } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import type { MovieCardData } from "@/types/content.types";
import { normalizeTmdbImageUrl } from "@/utils/tmdbImage";

interface HomeFeatureSliderProps {
  title: string;
  href: string;
  viewMoreLabel: string;
  movies: MovieCardData[];
}

export default function HomeFeatureSlider({
  title,
  href,
  viewMoreLabel,
  movies,
}: HomeFeatureSliderProps) {
  const titleId = useId();
  const items = useMemo(() => movies.slice(0, 15), [movies]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const swipeStartXRef = useRef<number | null>(null);
  const swipeStartYRef = useRef<number | null>(null);
  const swipeHandledRef = useRef(false);
  const active = items[activeIndex] ?? items[0];
  const visible = items[visibleIndex] ?? active;

  useEffect(() => {
    if (activeIndex === visibleIndex) {
      return;
    }

    setIsTransitioning(true);
    const timeout = window.setTimeout(() => {
      setVisibleIndex(activeIndex);
      window.setTimeout(() => setIsTransitioning(false), 40);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, visibleIndex]);

  if (!visible) {
    return null;
  }

  const background = normalizeTmdbImageUrl(
    visible.backgroundImage || visible.posterImage || visible.poster,
    "w1280"
  ) || FALLBACK_POSTER;
  const score =
    typeof visible.rating === "number" && visible.rating > 0 ? visible.rating.toFixed(1) : null;
  const duration = visible.duration && visible.duration !== "N/A" ? visible.duration : null;
  const watchType = visible.href?.includes("/tv/") ? "tv" : "movie";
  const watchHref = `/watch/${watchType}-${visible.tmdbId}`;

  const goToRelativeSlide = (direction: "prev" | "next") => {
    if (items.length <= 1 || isTransitioning) return;

    setActiveIndex((current) => {
      if (direction === "next") {
        return (current + 1) % items.length;
      }

      return (current - 1 + items.length) % items.length;
    });
  };

  const handleSwipeStart = (clientX: number, clientY: number) => {
    swipeStartXRef.current = clientX;
    swipeStartYRef.current = clientY;
    swipeHandledRef.current = false;
  };

  const handleSwipeMove = (clientX: number, clientY: number) => {
    const startX = swipeStartXRef.current;
    const startY = swipeStartYRef.current;

    if (startX === null || startY === null || swipeHandledRef.current) return;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    const isHorizontalSwipe = Math.abs(deltaX) > 54 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;

    if (!isHorizontalSwipe) return;

    swipeHandledRef.current = true;
    goToRelativeSlide(deltaX < 0 ? "next" : "prev");
  };

  const handleSwipeEnd = () => {
    swipeStartXRef.current = null;
    swipeStartYRef.current = null;
    swipeHandledRef.current = false;
  };

  return (
    <section className="home-feature-slider" aria-labelledby={titleId}>
      <div className="home-feature-slider__header">
        <Link href={href} className="home-feature-slider__title-link" aria-label={viewMoreLabel}>
          <h2 id={titleId}>{title}</h2>
          <span>
            <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
          </span>
        </Link>
      </div>

      <div
        className="home-feature-slider__stage"
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          handleSwipeStart(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => handleSwipeMove(event.clientX, event.clientY)}
        onPointerUp={handleSwipeEnd}
        onPointerCancel={handleSwipeEnd}
        onMouseLeave={handleSwipeEnd}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) handleSwipeStart(touch.clientX, touch.clientY);
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch) handleSwipeMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={handleSwipeEnd}
      >
        <Link href={visible.href} className="home-feature-slider__stage-link" aria-label={visible.title} />
        <Image
          key={visible.id}
          src={background}
          alt={visible.title}
          fill
          sizes="100vw"
          priority={visibleIndex === 0}
          className={`object-cover home-feature-slider__image${
            isTransitioning ? " is-fading" : ""
          }`}
        />
        <div className="home-feature-slider__fade" />

        <div
          key={`content-${visible.id}`}
          className={`home-feature-slider__content${
            isTransitioning ? " is-fading" : ""
          }`}
        >
          <h3 title={visible.title}>
            <Link href={visible.href}>{visible.title}</Link>
          </h3>
          <p className="home-feature-slider__alias" title={visible.aliasTitle}>
            {visible.aliasTitle}
          </p>

          <div className="home-feature-slider__tags">
            {score && <span className="home-feature-slider__tag-imdb">IMDb {score}</span>}
            <span>T16</span>
            {visible.year && <span>{visible.year}</span>}
            {duration && <span>{duration}</span>}
          </div>

          <div className="home-feature-slider__genres" aria-hidden={!visible.genre}>
            {visible.genre && <span>{visible.genre}</span>}
          </div>

          <p className="home-feature-slider__description">
            {visible.description || ""}
          </p>

          <div className="home-feature-slider__actions">
            <Link href={watchHref} className="home-feature-slider__play" aria-label={`Watch ${visible.title}`}>
              <Play size={26} fill="currentColor" />
            </Link>
            <div className="home-feature-slider__action-group">
              <FavoriteButton
                movie={{
                  id: visible.tmdbId,
                  tmdbId: visible.tmdbId,
                  title: visible.title,
                  poster_path: visible.posterImage || visible.poster,
                  vote_average: visible.rating,
                  media_type: watchType,
                  overview: visible.description,
                  genres: visible.genres?.map((genre) => ({ id: 0, name: genre })) || [],
                }}
                iconOnly
                stopPropagation
                preventDefault
                className="home-feature-slider__favorite"
                activeClassName="home-feature-slider__favorite--active"
              />
              <Link
                href={visible.href}
                className="home-feature-slider__info-button"
                aria-label={`Details for ${visible.title}`}
              >
                <Info size={20} fill="currentColor" />
              </Link>
            </div>
          </div>
        </div>

        <div className="home-feature-slider__thumbs" aria-label={`${title} thumbnails`}>
          {items.map((movie, index) => {
            const thumb =
              normalizeTmdbImageUrl(movie.posterImage || movie.poster, "w154") ||
              normalizeTmdbImageUrl(movie.backgroundImage, "w300") ||
              FALLBACK_POSTER;

            return (
              <button
                key={`feature-thumb-${movie.id}-${index}`}
                type="button"
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => setActiveIndex(index)}
                aria-label={movie.title}
              >
                <Image
                  src={thumb}
                  alt={movie.title}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
