"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart, Info, Play } from "lucide-react";
import { useId, useMemo, useState } from "react";
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
  const active = items[activeIndex] ?? items[0];

  if (!active) {
    return null;
  }

  const background = active.backgroundImage || active.posterImage || active.poster || FALLBACK_POSTER;
  const score =
    typeof active.rating === "number" && active.rating > 0 ? active.rating.toFixed(1) : null;
  const duration = active.duration && active.duration !== "N/A" ? active.duration : null;
  const watchType = active.href?.includes("/tv/") ? "tv" : "movie";
  const watchHref = `/watch/${watchType}-${active.tmdbId}`;

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
        <Link href={active.href} className="home-feature-slider__stage-link" aria-label={active.title} />
        <Image
          key={active.id}
          src={background}
          alt={active.title}
          fill
          sizes="100vw"
          priority={activeIndex === 0}
          className="object-cover"
        />
        <div className="home-feature-slider__fade" />

        <div className="home-feature-slider__content">
          <h3 title={active.title}>
            <Link href={active.href}>{active.title}</Link>
          </h3>
          <p className="home-feature-slider__alias" title={active.aliasTitle}>
            {active.aliasTitle}
          </p>

          <div className="home-feature-slider__tags">
            {score && <span className="home-feature-slider__tag-imdb">IMDb {score}</span>}
            <span>T16</span>
            {active.year && <span>{active.year}</span>}
            {duration && <span>{duration}</span>}
          </div>

          <div className="home-feature-slider__genres" aria-hidden={!active.genre}>
            {active.genre && <span>{active.genre}</span>}
          </div>

          <p className="home-feature-slider__description">
            {active.description || ""}
          </p>

          <div className="home-feature-slider__actions">
            <Link href={watchHref} className="home-feature-slider__play" aria-label={`Watch ${active.title}`}>
              <Play size={26} fill="currentColor" />
            </Link>
            <div className="home-feature-slider__action-group">
              <button type="button" aria-label="Favorite">
                <Heart size={20} fill="currentColor" />
              </button>
              <Link href={active.href} aria-label={`Details for ${active.title}`}>
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
