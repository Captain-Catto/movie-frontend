"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Info, Play } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import type { MovieCardData } from "@/types/content.types";

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

  const background = visible.backgroundImage || visible.posterImage || visible.poster || FALLBACK_POSTER;
  const score =
    typeof visible.rating === "number" && visible.rating > 0 ? visible.rating.toFixed(1) : null;
  const duration = visible.duration && visible.duration !== "N/A" ? visible.duration : null;
  const watchType = visible.href?.includes("/tv/") ? "tv" : "movie";
  const watchHref = `/watch/${watchType}-${visible.tmdbId}`;

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

      <div className="home-feature-slider__stage">
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
            const thumb = movie.posterImage || movie.poster || movie.backgroundImage || FALLBACK_POSTER;

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
