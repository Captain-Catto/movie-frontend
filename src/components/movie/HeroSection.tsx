"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import HeroSkeleton from "@/components/ui/HeroSkeleton";
import type { MovieCardData } from "@/types/content.types";
import GenreBadge from "@/components/ui/GenreBadge";
import { FALLBACK_POSTER } from "@/constants/app.constants";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { analyticsService } from "@/services/analytics.service";
import { useLanguage } from "@/contexts/LanguageContext";
import { getHeroSectionUiMessages } from "@/lib/ui-messages";
import { normalizeTmdbImageUrl } from "@/utils/tmdbImage";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Info } from "lucide-react";

interface HeroSectionProps {
  movies: MovieCardData[];
  isLoading?: boolean;
}

const HERO_TMDB_BACKDROP_SIZE = "w1280";
const HERO_TMDB_MOBILE_BACKDROP_SIZE = "w780";
const HERO_TMDB_THUMB_SIZE = "w300";

const toHeroBackdrop = (url: string, isMobile: boolean): string => {
  return (
    normalizeTmdbImageUrl(
      url,
      isMobile ? HERO_TMDB_MOBILE_BACKDROP_SIZE : HERO_TMDB_BACKDROP_SIZE
    ) || url
  );
};

const toHeroThumb = (url: string): string => {
  return normalizeTmdbImageUrl(url, HERO_TMDB_THUMB_SIZE) || url;
};

interface FlipAnim {
  src: string;
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  active: boolean;
  fadingOut: boolean;
}

function HeroFlipOverlay({ flipAnim }: { flipAnim: FlipAnim | null }) {
  if (!flipAnim) return null;

  return (
    <div
      className="absolute inset-0 z-[60] pointer-events-none bg-cover bg-center origin-top-left [transition:transform_0.55s_cubic-bezier(0.4,0,0.2,1),opacity_0.37s_ease,border-radius_0.55s_ease]"
      style={{
        backgroundImage: `url(${flipAnim.src})`,
        transform: flipAnim.active
          ? "translate(0px, 0px) scale(1, 1)"
          : `translate(${flipAnim.tx}px, ${flipAnim.ty}px) scale(${flipAnim.sx}, ${flipAnim.sy})`,
        opacity: flipAnim.fadingOut ? 0 : flipAnim.active ? 1 : 0.85,
        borderRadius: flipAnim.active ? "0px" : "8px",
      }}
    />
  );
}

function normalizeRating(movie: MovieCardData): number | null {
  const rawRatingCandidates: Array<number | string | null | undefined> = [
    typeof movie.rating === "number" || typeof movie.rating === "string"
      ? movie.rating
      : null,
    (movie as { voteAverage?: number | string }).voteAverage,
    (movie as { vote_average?: number | string }).vote_average,
    (movie as { score?: number | string }).score,
    (movie as { voteScore?: number | string }).voteScore,
  ];

  return rawRatingCandidates.reduce<number | null>((acc, current) => {
    if (acc !== null) return acc;
    if (current === null || current === undefined) return null;

    const value =
      typeof current === "string"
        ? parseFloat(current.replace(",", "."))
        : current;

    if (!Number.isFinite(value) || value < 0) return acc;
    return Math.round(value * 10) / 10;
  }, null);
}

function buildHeroSlideData(movie: MovieCardData, isMobile: boolean) {
  const backgroundImage = movie.backgroundImage || movie.poster || FALLBACK_POSTER;
  const posterImage =
    movie.posterImage || movie.poster || backgroundImage || FALLBACK_POSTER;
  const normalizedRating = normalizeRating(movie);
  const contentType = (movie.href.includes("/tv/") ? "tv" : "movie") as "movie" | "tv";
  const watchTargetId = movie.tmdbId || parseInt(movie.id, 10) || movie.id;

  return {
    backgroundImage,
    heroBackgroundImage: toHeroBackdrop(backgroundImage, isMobile),
    posterImage,
    hasRating: normalizedRating !== null,
    displayRating: normalizedRating ?? 0,
    contentType,
    watchHref: watchTargetId ? `/watch/${contentType}-${watchTargetId}` : movie.href,
  };
}

function HeroSlideContent({
  movie,
  isVisible,
  language,
  labels,
  contentType,
  posterImage,
  hasRating,
  displayRating,
  watchHref,
  onDetailClick,
  onWatchClick,
}: {
  movie: MovieCardData;
  isVisible: boolean;
  language: string;
  labels: ReturnType<typeof getHeroSectionUiMessages>;
  contentType: "movie" | "tv";
  posterImage: string;
  hasRating: boolean;
  displayRating: number;
  watchHref: string;
  onDetailClick: () => void;
  onWatchClick: () => void;
}) {
  return (
    <div
      className={`media-item max-w-2xl lg:max-w-4xl xl:max-w-5xl gap-y-6 ${
        isVisible ? "hero-content-ready" : ""
      }`}
    >
      <h1 className="hero-content-fade hero-content-fade--title text-5xl font-semibold text-white">
        <Link title={movie.title} href={movie.href} onClick={onDetailClick}>
          {movie.title}
        </Link>
      </h1>

      <p className="hero-content-fade hero-content-fade--subtitle media-alias-title">
        <Link
          title={movie.aliasTitle || movie.title}
          href={movie.href}
          className="text-gray-300 text-xl"
          onClick={onDetailClick}
        >
          {movie.aliasTitle || movie.title}
        </Link>
      </p>

      <div className="hero-content-fade hero-content-fade--tags hl-tags flex flex-wrap gap-2">
        <div className="tag-media-type">
          <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
            {contentType === "tv" ? labels.tvSeries : labels.movie}
          </span>
        </div>

        {hasRating && (
          <div className="tag-rating">
            <span className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-bold flex items-center gap-1">
              <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {displayRating}
            </span>
          </div>
        )}

        <div className="tag-year">
          <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm" suppressHydrationWarning>
            {movie.year}
          </span>
        </div>
      </div>

      <div className="hero-content-fade hero-content-fade--tags hl-tags mb-4 flex flex-wrap gap-2">
        {movie.genres?.map((genre, genreIndex) => {
          const genreId = movie.genreIds?.[genreIndex];
          if (typeof genreId !== "number") return null;

          return (
            <GenreBadge
              key={`${genreId}-${genreIndex}`}
              genre={genre}
              genreId={genreId}
              contentType={contentType}
              variant="hero"
            />
          );
        })}
      </div>

      <div className="hero-content-fade hero-content-fade--desc description lim-3 text-gray-300 text-base leading-relaxed line-clamp-3">
        {movie.description}
      </div>

      <div className="hero-content-fade hero-content-fade--buttons touch flex items-center gap-x-4">
        <Link
          href={watchHref}
          className="button-play"
          onClick={onWatchClick}
          aria-label={
            language.startsWith("vi") ? `Xem ${movie.title}` : `Watch ${movie.title}`
          }
        >
          <div className="text-white rounded-full size-12 flex items-center justify-center transition-colors cursor-pointer">
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </Link>

        <div className="touch-group flex items-center gap-x-2">
          <FavoriteButton
            movie={{
              id: movie.tmdbId,
              title: movie.title,
              poster_path: posterImage,
              vote_average: displayRating,
              media_type: contentType,
              overview: movie.description ?? "",
              genres:
                movie.genres?.map((genre) => ({
                  id: 0,
                  name: genre,
                })) || [],
            }}
            iconOnly={true}
            className="!p-3"
          />
          <Link
            href={movie.href}
            className="item"
            onClick={onDetailClick}
            aria-label={
              language.startsWith("vi")
                ? `Xem thông tin ${movie.title}`
                : `View information about ${movie.title}`
            }
          >
            <Info className="size-6 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function HeroSlide({
  movie,
  index,
  isMobile,
  isVisible,
  language,
  labels,
}: {
  movie: MovieCardData;
  index: number;
  isMobile: boolean;
  isVisible: boolean;
  language: string;
  labels: ReturnType<typeof getHeroSectionUiMessages>;
}) {
  const {
    heroBackgroundImage,
    posterImage,
    hasRating,
    displayRating,
    contentType,
    watchHref,
  } = buildHeroSlideData(movie, isMobile);
  const analyticsContentType = contentType === "tv" ? "tv_series" : "movie";

  const handleDetailClick = () => {
    analyticsService.trackClick(
      String(movie.tmdbId),
      analyticsContentType,
      movie.title
    );
  };

  const handleWatchClick = () => {
    analyticsService.trackPlay(
      String(movie.tmdbId),
      analyticsContentType,
      movie.title,
      { source: "hero_watch_button", context: "hero_banner" }
    );
  };

  return (
    <SwiperSlide key={movie.id} className="relative">
      <div className="slide-elements relative h-full">
        <Link
          href={movie.href}
          className="slide-url absolute inset-0 z-10"
          onClick={handleDetailClick}
          aria-label={
            language.startsWith("vi")
              ? `Xem chi tiết ${movie.title}`
              : `View details for ${movie.title}`
          }
        />
        <div
          className="background-fade absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackgroundImage})` }}
        >
          <Image
            className="fade-in visible size-full object-cover"
            title={movie.title}
            src={heroBackgroundImage}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1536px) 90vw, 1280px"
            quality={55}
            priority={index === 0}
          />
        </div>
        <div className="cover-fade absolute inset-0" />
        <div className="safe-area relative z-20 h-full flex items-center">
          <div className="slide-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <HeroSlideContent
              movie={movie}
              isVisible={isVisible}
              language={language}
              labels={labels}
              contentType={contentType}
              posterImage={posterImage}
              hasRating={hasRating}
              displayRating={displayRating}
              watchHref={watchHref}
              onDetailClick={handleDetailClick}
              onWatchClick={handleWatchClick}
            />
          </div>
        </div>
      </div>
    </SwiperSlide>
  );
}

function HeroThumbnailNav({
  movies,
  activeIndex,
  onThumbnailClick,
}: {
  movies: MovieCardData[];
  activeIndex: number;
  onThumbnailClick: (index: number, event: React.MouseEvent) => void;
}) {
  if (movies.length <= 1) return null;

  return (
    <div className="absolute bottom-6 left-1/2 z-30 w-full -translate-x-1/2 px-4 lg:left-auto lg:right-6 lg:w-auto lg:translate-x-0 lg:px-0">
      <div className="flex flex-nowrap justify-center gap-2 sm:gap-3 lg:flex-wrap lg:justify-end lg:gap-5">
        {movies.slice(0, 10).map((movie, index) => {
          const backgroundImage =
            movie.backgroundImage || movie.poster || FALLBACK_POSTER;
          const posterImage =
            movie.posterImage || movie.poster || backgroundImage;
          const responsiveVisibility =
            index >= 8 ? "hidden lg:block" : index >= 5 ? "hidden sm:block" : "";

          return (
            <button
              type="button"
              key={movie.id}
              onClick={(event) => onThumbnailClick(index, event)}
              className={`
                ${responsiveVisibility} cursor-pointer overflow-hidden rounded-md transition-all duration-300
                ${
                  activeIndex === index
                    ? "scale-105 opacity-100 ring-2 ring-white"
                    : "opacity-70 hover:opacity-90 hover:scale-105"
                }
              `}
              aria-label={movie.title}
            >
              <Image
                src={toHeroThumb(backgroundImage || posterImage)}
                alt={movie.title}
                width={104}
                height={62}
                sizes="(max-width: 1023px) 48px, 104px"
                quality={45}
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                className="h-8 w-12 object-cover lg:h-[62px] lg:w-[104px]"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const HeroSection = ({ movies, isLoading = false }: HeroSectionProps) => {
  const { language } = useLanguage();
  const labels = getHeroSectionUiMessages(language);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleContentIndex, setVisibleContentIndex] = useState(0);
  const [flipAnim, setFlipAnim] = useState<FlipAnim | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const { breakpoint } = useWindowWidth();
  const isMobile = breakpoint === "mobile";

  if (!movies || movies.length === 0 || isLoading) return <HeroSkeleton />;

  const canLoop = movies.length > 2;

  const handleThumbnailClick = (index: number, event: React.MouseEvent) => {
    if (flipAnim || index === activeIndex || !swiperRef.current) return;

    if (isMobile) {
      if (canLoop) {
        swiperRef.current.slideToLoop(index);
      } else {
        swiperRef.current.slideTo(index);
      }
      return;
    }

    const heroEl = heroRef.current;
    if (!heroEl) {
      if (canLoop) {
        swiperRef.current.slideToLoop(index);
      } else {
        swiperRef.current.slideTo(index);
      }
      setActiveIndex(index);
      setVisibleContentIndex(index);
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const heroRect = heroEl.getBoundingClientRect();
    const movie = movies[index];

    setFlipAnim({
      src:
        movie.backgroundImage ||
        movie.posterImage ||
        movie.poster ||
        FALLBACK_POSTER,
      tx: rect.left - heroRect.left,
      ty: rect.top - heroRect.top,
      sx: rect.width / heroRect.width,
      sy: rect.height / heroRect.height,
      active: false,
      fadingOut: false,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipAnim((prev) => (prev ? { ...prev, active: true } : null));
      });
    });

    setTimeout(() => {
      if (canLoop) {
        swiperRef.current?.slideToLoop(index, 0);
      } else {
        swiperRef.current?.slideTo(index, 0);
      }
      setActiveIndex(index);
      setVisibleContentIndex(index);
    }, 420);

    setTimeout(() => {
      setFlipAnim((prev) => (prev ? { ...prev, fadingOut: true } : null));
    }, 450);

    setTimeout(() => {
      setFlipAnim(null);
    }, 820);
  };

  return (
    <div ref={heroRef} className="relative min-h-[100dvh] overflow-hidden">
      <HeroFlipOverlay flipAnim={flipAnim} />

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0}
        speed={600}
        slidesPerView={1}
        pagination={{ clickable: true, el: ".swiper-pagination-custom" }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={canLoop}
        className="h-[100dvh]"
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onSlideChangeTransitionStart={() => setVisibleContentIndex(-1)}
        onSlideChangeTransitionEnd={(swiper) =>
          setVisibleContentIndex(swiper.realIndex)
        }
      >
        {movies.map((movie, index) => (
          <HeroSlide
            key={movie.id}
            movie={movie}
            index={index}
            isMobile={isMobile}
            isVisible={index === visibleContentIndex}
            language={language}
            labels={labels}
          />
        ))}

        <div className="swiper-pagination-custom absolute bottom-8 left-1/2 -translate-x-1/2 z-30"></div>
      </Swiper>

      <HeroThumbnailNav
        movies={movies}
        activeIndex={activeIndex}
        onThumbnailClick={handleThumbnailClick}
      />
    </div>
  );
};

export default HeroSection;
