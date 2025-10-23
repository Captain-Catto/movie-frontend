"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import HeroSkeleton from "@/components/ui/HeroSkeleton";
import { useLoading } from "@/hooks/useLoading";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Info } from "lucide-react";

interface HeroSectionProps {
  movies: Array<{
    id: string;
    title: string;
    aliasTitle: string;
    rating: number;
    year: number;
    duration: string;
    season: string;
    episode: string;
    genres: string[];
    description: string;
    backgroundImage: string;
    posterImage: string;
    scenes: string[];
    href: string;
  }>;
}

const HeroSection = ({ movies }: HeroSectionProps) => {
  const { isLoading } = useLoading({ delay: 1200 });
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  console.log("HeroSection movies:", movies);

  if (!movies || movies.length === 0 || isLoading) return <HeroSkeleton />;

  const handleThumbnailClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Swiper
        modules={[Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          el: ".swiper-pagination-custom",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        loop={movies.length > 1}
        className="h-screen"
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {movies.map((movie, index) => (
          <SwiperSlide key={movie.id} className="relative">
            <div className="slide-elements relative h-full">
              <Link
                href={movie.href}
                className="slide-url absolute inset-0 z-10"
              />
              {/* Background Fade */}
              <div
                className="background-fade absolute inset-0"
                style={{ backgroundImage: `url("${movie.backgroundImage}")` }}
              />
              {/* Cover Fade */}
              <div className="cover-fade absolute inset-0">
                <div className="cover-image w-full h-full">
                  <img
                    className="fade-in visible w-full h-full object-cover"
                    title={movie.title}
                    loading="lazy"
                    src={movie.backgroundImage}
                    alt={movie.title}
                  />
                </div>
              </div>
              {/* Overlay */}
              {/* <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" /> */}
              {/* Overlay có 2 mép trái phải thì xám nhẹ còn chính giữa hơn 50% màu bình thường */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/90 via-gray-800/30 to-gray-800/90" />{" "}
              {/* Safe Area Content */}
              <div className="safe-area relative z-20 h-full flex items-center">
                <div className="slide-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="media-item max-w-2xl space-y-6">
                    {/* Main Title */}
                    <h1 className="text-5xl font-bold text-white">
                      <Link title={movie.title} href={movie.href}>
                        {movie.title}
                      </Link>
                    </h1>

                    {/* Alias Title */}
                    <h3 className="media-alias-title">
                      <Link
                        title={movie.aliasTitle || movie.title}
                        href={movie.href}
                        className="text-gray-300 text-xl"
                      >
                        {movie.aliasTitle || movie.title}
                      </Link>
                    </h3>

                    {/* Tags */}
                    <div className="hl-tags flex flex-wrap gap-2">
                      {/* Media Type */}
                      <div className="tag-media-type">
                        <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                          {movie.href.includes("/tv/") ? "TV Series" : "Movie"}
                        </span>
                      </div>

                      {/* Rating */}
                      {movie.rating && parseFloat(String(movie.rating)) > 0 && (
                        <div className="tag-rating">
                          <span className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-bold flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {movie.rating}
                          </span>
                        </div>
                      )}

                      {/* Year */}
                      <div className="tag-year">
                        <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
                          {movie.year}
                        </span>
                      </div>
                    </div>

                    {/* Genre Tags */}
                    <div className="hl-tags mb-4 flex flex-wrap gap-2">
                      {movie.genres?.map((genre, genreIndex) => (
                        <Link
                          key={genreIndex}
                          href={`/genre/${genre}`}
                          className="tag-topic"
                        >
                          {genre}
                        </Link>
                      ))}
                    </div>

                    {/* Description */}
                    <div className="description lim-3 text-gray-300 text-base leading-relaxed line-clamp-3">
                      {movie.description}
                    </div>

                    {/* Touch/Action Buttons */}
                    <div className="touch flex items-center space-x-4">
                      <Link href={movie.href} className="button-play">
                        <button className="text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </button>
                      </Link>

                      <div className="touch-group flex items-center space-x-2">
                        <FavoriteButton
                          movie={{
                            id: parseInt(movie.id),
                            title: movie.title,
                            poster_path:
                              movie.posterImage || movie.backgroundImage,
                            vote_average: movie.rating || 0,
                            media_type: movie.href.includes("/tv/")
                              ? "tv"
                              : "movie",
                            overview: movie.description,
                            genres:
                              movie.genres?.map((genre) => ({
                                id: 0,
                                name: genre,
                              })) || [],
                          }}
                          iconOnly={true}
                          className="!p-3"
                        />
                        <Link href={movie.href} className="item">
                          <Info className="w-6 h-6 text-gray-400" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Pagination */}
        <div className="swiper-pagination-custom absolute bottom-8 left-1/2 -translate-x-1/2 z-30"></div>
      </Swiper>

      {/* Thumbnail Navigation */}
      {movies.length > 1 && (
        <div className="absolute bottom-8 right-8 z-30 flex space-x-2">
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              onClick={() => handleThumbnailClick(index)}
              className={`
                cursor-pointer transition-all duration-300 rounded-md overflow-hidden
                ${
                  activeIndex === index
                    ? "ring-2 ring-white scale-110 opacity-100"
                    : "opacity-70 hover:opacity-90 hover:scale-105"
                }
              `}
            >
              <img
                src={movie.backgroundImage || movie.posterImage}
                alt={movie.title}
                className="w-20 h-12 object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSection;
