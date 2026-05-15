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

const toHeroBackdrop = (url: string): string => {
  if (!url.includes("image.tmdb.org/t/p/")) {
    return url;
  }

  return url.replace(
    /\/t\/p\/(?:w\d+|original)\//,
    `/t/p/${HERO_TMDB_BACKDROP_SIZE}/`
  );
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

const HeroSection = ({ movies, isLoading = false }: HeroSectionProps) => {
  const { language } = useLanguage();
  const labels = getHeroSectionUiMessages(language);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleContentIndex, setVisibleContentIndex] = useState(0);
  const [flipAnim, setFlipAnim] = useState<FlipAnim | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const { breakpoint } = useWindowWidth();
  const thumbCount =
    breakpoint === "desktop" ? 10 : breakpoint === "tablet" ? 8 : 5;
  const isMobile = breakpoint === "mobile";

  if (!movies || movies.length === 0 || isLoading) return <HeroSkeleton />;

  const handleThumbnailClick = (index: number, event: React.MouseEvent) => {
    if (flipAnim || index === activeIndex || !swiperRef.current) return;

    if (isMobile) {
      swiperRef.current.slideToLoop(index);
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const sx = rect.width / window.innerWidth;
    const sy = rect.height / window.innerHeight;
    const movie = movies[index];
    const src =
      movie.backgroundImage || movie.posterImage || movie.poster || FALLBACK_POSTER;

    setFlipAnim({ src, tx: rect.left, ty: rect.top, sx, sy, active: false, fadingOut: false });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlipAnim((prev) => (prev ? { ...prev, active: true } : null));
      });
    });

    // Swiper chuyển slide + overlay bắt đầu fade out cùng lúc → image & text xuất hiện cùng nhau
    setTimeout(() => {
      swiperRef.current?.slideToLoop(index, 0);
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
    <div className="relative min-h-screen">
      {/* FLIP overlay — thumbnail bay lên fill hero */}
      {flipAnim && (
        <div
          className="fixed inset-0 z-[60] pointer-events-none"
          style={{
            backgroundImage: `url(${flipAnim.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transformOrigin: "top left",
            transform: flipAnim.active
              ? "translate(0px, 0px) scale(1, 1)"
              : `translate(${flipAnim.tx}px, ${flipAnim.ty}px) scale(${flipAnim.sx}, ${flipAnim.sy})`,
            opacity: flipAnim.fadingOut ? 0 : flipAnim.active ? 1 : 0.85,
            borderRadius: flipAnim.active ? "0px" : "8px",
            transition:
              "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.37s ease, border-radius 0.55s ease",
          }}
        />
      )}

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0}
        speed={600}
        slidesPerView={1}
        pagination={{
          clickable: true,
          el: ".swiper-pagination-custom",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="h-screen"
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onSlideChangeTransitionStart={() => setVisibleContentIndex(-1)}
        onSlideChangeTransitionEnd={(swiper) =>
          setVisibleContentIndex(swiper.realIndex)
        }
      >
        {movies.map((movie, index) => {
          const backgroundImage =
            movie.backgroundImage || movie.poster || FALLBACK_POSTER;
          const heroBackgroundImage = toHeroBackdrop(backgroundImage);
          const posterImage =
            movie.posterImage || movie.poster || backgroundImage || FALLBACK_POSTER;
          const rawRatingCandidates: Array<number | string | null | undefined> = [
            typeof movie.rating === "number" || typeof movie.rating === "string"
              ? movie.rating
              : null,
            (movie as { voteAverage?: number | string }).voteAverage,
            (movie as { vote_average?: number | string }).vote_average,
            (movie as { score?: number | string }).score,
            (movie as { voteScore?: number | string }).voteScore,
          ];

          const normalizedRating = rawRatingCandidates.reduce<number | null>(
            (acc, current) => {
              if (acc !== null) return acc;
              if (current === null || current === undefined) return null;

              let value: number;
              if (typeof current === "string") {
                const parsed = parseFloat(current.replace(",", "."));
                if (Number.isNaN(parsed)) return acc;
                value = parsed;
              } else {
                value = current;
              }

              if (!Number.isFinite(value) || value < 0) return acc;
              return Math.round(value * 10) / 10;
            },
            null
          );

          const hasRating = normalizedRating !== null;
          const displayRating = normalizedRating ?? 0;
          const year = movie.year ?? new Date().getFullYear();
          const contentType = movie.href.includes("/tv/") ? "tv" : "movie";
          const watchTargetId =
            movie.tmdbId || parseInt(movie.id, 10) || movie.id;
          const watchHref = watchTargetId
            ? `/watch/${contentType}-${watchTargetId}`
            : movie.href;

          // Analytics tracking handlers
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
                {/* Background Fade */}
                <div className="background-fade absolute inset-0" />
                {/* Cover Fade */}
                <div className="cover-fade absolute inset-0">
                  <div className="cover-image relative w-full h-full">
                    <Image
                      className="fade-in visible w-full h-full object-cover"
                      title={movie.title}
                      src={heroBackgroundImage}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1536px) 90vw, 1280px"
                      quality={55}
                      priority={index === 0}
                  />
                </div>
              </div>
              {/* Safe Area Content */}
              <div className="safe-area relative z-20 h-full flex items-center">
                <div className="slide-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div
                    className={`media-item max-w-2xl space-y-6 ${
                      index === visibleContentIndex ? "hero-content-ready" : ""
                    }`}
                  >
                    {/* Main Title */}
                    <h1 className="hero-content-fade hero-content-fade--title text-5xl font-bold text-white">
                      <Link title={movie.title} href={movie.href} onClick={handleDetailClick}>
                        {movie.title}
                      </Link>
                    </h1>

                    {/* Alias Title */}
                    <p className="hero-content-fade hero-content-fade--subtitle media-alias-title">
                      <Link
                        title={movie.aliasTitle || movie.title}
                        href={movie.href}
                        className="text-gray-300 text-xl"
                        onClick={handleDetailClick}
                      >
                        {movie.aliasTitle || movie.title}
                      </Link>
                    </p>

                    {/* Tags */}
                    <div className="hero-content-fade hero-content-fade--tags hl-tags flex flex-wrap gap-2">
                      {/* Media Type */}
                      <div className="tag-media-type">
                        <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                          {movie.href.includes("/tv/")
                             ? labels.tvSeries
                            : labels.movie}
                        </span>
                      </div>

                      {/* Rating */}
                      {hasRating && (
                        <div className="tag-rating">
                          <span className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-bold flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {displayRating}
                          </span>
                        </div>
                      )}

                      {/* Year */}
                      <div className="tag-year">
                        <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
                          {year}
                        </span>
                      </div>
                    </div>

                    {/* Genre Tags */}
                    <div className="hero-content-fade hero-content-fade--tags hl-tags mb-4 flex flex-wrap gap-2">
                      {movie.genres?.map((genre, genreIndex) => {
                        const genreId = movie.genreIds?.[genreIndex];
                        if (typeof genreId !== "number") {
                          return null;
                        }
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

                    {/* Description */}
                    <div className="hero-content-fade hero-content-fade--desc description lim-3 text-gray-300 text-base leading-relaxed line-clamp-3">
                      {movie.description}
                    </div>

                    {/* Touch/Action Buttons */}
                    <div className="hero-content-fade hero-content-fade--buttons touch flex items-center space-x-4">
                      <Link
                        href={watchHref}
                        className="button-play"
                        onClick={handleWatchClick}
                        aria-label={
                          language.startsWith("vi")
                            ? `Xem ${movie.title}`
                            : `Watch ${movie.title}`
                        }
                      >
                        <div className="text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors cursor-pointer">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </Link>

                      <div className="touch-group flex items-center space-x-2">
                        <FavoriteButton
                          movie={{
                            id: movie.tmdbId,
                            title: movie.title,
                            poster_path: posterImage,
                            vote_average: displayRating,
                            media_type: movie.href.includes("/tv/")
                              ? "tv"
                              : "movie",
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
                          onClick={handleDetailClick}
                          aria-label={
                            language.startsWith("vi")
                              ? `Xem thông tin ${movie.title}`
                              : `View information about ${movie.title}`
                          }
                        >
                          <Info className="w-6 h-6 text-gray-400" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </SwiperSlide>
          );
        })}

        {/* Custom Pagination */}
        <div className="swiper-pagination-custom absolute bottom-8 left-1/2 -translate-x-1/2 z-30"></div>
      </Swiper>

      {/* Thumbnail Navigation */}
      {movies.length > 1 && (
        <div
          className={`absolute bottom-6 z-30 ${
            isMobile
              ? "left-1/2 -translate-x-1/2 w-full px-4"
              : "right-6"
          }`}
        >
          <div
            className={`flex ${
              isMobile
                ? "flex-nowrap justify-center gap-1"
                : "flex-wrap justify-end gap-2"
            }`}
          >
            {movies.slice(0, thumbCount).map((movie, index) => {
              const backgroundImage =
                movie.backgroundImage || movie.poster || FALLBACK_POSTER;
              const posterImage =
                movie.posterImage || movie.poster || backgroundImage;

              return (
                <div
                  key={movie.id}
                  onClick={(e) => handleThumbnailClick(index, e)}
                  className={`
                    cursor-pointer transition-all duration-300 rounded-md overflow-hidden
                    ${
                      activeIndex === index
                        ? `ring-2 ring-white ${
                            isMobile ? "scale-105" : "scale-110"
                          } opacity-100`
                        : "opacity-70 hover:opacity-90 hover:scale-105"
                    }
                  `}
                >
                  <Image
                    src={backgroundImage || posterImage}
                    alt={movie.title}
                    width={80}
                    height={48}
                    sizes={isMobile ? "48px" : "80px"}
                    quality={45}
                    className={isMobile ? "h-8 w-12 object-cover" : "w-20 h-12 object-cover"}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
