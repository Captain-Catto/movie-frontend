"use client";

import { lazy, Suspense } from "react";
import type { SyntheticEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import TrailerButton from "@/components/ui/TrailerButton";
import CastSkeleton from "@/components/ui/CastSkeleton";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import GenreBadge from "@/components/ui/GenreBadge";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import { analyticsService } from "@/services/analytics.service";
import type { MovieDetail } from "@/types/content.types";
import type { CastMember } from "@/types";
import { useMovieDetailPageClient } from "@/hooks/pages/useMovieDetailPageClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocaleFromLanguage } from "@/constants/app.constants";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";

const RecommendationsSection = lazy(
  () => import("@/components/movie/RecommendationsSection")
);

interface MovieDetailPageClientProps {
  movieId: string;
  initialLanguage: string;
  initialMovieData: MovieDetail | null;
  initialContentType: "movie" | "tv" | null;
  initialError: string | null;
}

const MovieDetailPageClient = ({
  movieId,
  initialLanguage,
  initialMovieData,
  initialContentType,
  initialError,
}: MovieDetailPageClientProps) => {
  const { language } = useLanguage();
  const locale = getLocaleFromLanguage(language);
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const {
    movieData,
    loading,
    creditsLoading,
    error,
    contentType,
  } = useMovieDetailPageClient({
    movieId,
    initialLanguage,
    initialMovieData,
    initialContentType,
    initialError,
  });

  const labels = {
    unknown: isVietnamese ? "Không rõ" : "Unknown",
    unknownTitle: isVietnamese ? "Không rõ tiêu đề" : "Unknown Title",
    loadingContent: isVietnamese
      ? "Không thể tải nội dung."
      : "Unable to load content.",
    errorPrefix: isVietnamese ? "Lỗi:" : "Error:",
    watchNow: isVietnamese ? "Xem ngay" : "Watch Now",
    overview: isVietnamese ? "Tổng quan" : "Overview",
    cast: isVietnamese ? "Diễn viên" : "Cast",
    contentInfo: isVietnamese ? "Thông tin phim" : "Movie Info",
    director: isVietnamese ? "Đạo diễn:" : "Director:",
    country: isVietnamese ? "Quốc gia:" : "Country:",
    releaseYear: isVietnamese ? "Năm phát hành:" : "Release Year:",
    runtime: isVietnamese ? "Thời lượng:" : "Runtime:",
    runtimeEpisode: isVietnamese ? "Thời lượng/tập:" : "Runtime/Episode:",
    quality: isVietnamese ? "Chất lượng:" : "Quality:",
    language: isVietnamese ? "Ngôn ngữ:" : "Language:",
    status: isVietnamese ? "Trạng thái:" : "Status:",
    youMightAlsoLike: isVietnamese ? "Có thể bạn cũng thích" : "You Might Also Like",
    notAvailable: isVietnamese ? "Không có" : "N/A",
  };

  const getLocalizedCountryName = (countryCodeOrName: string) => {
    const trimmed = countryCodeOrName.trim();
    if (!trimmed) return labels.unknown;

    if (/^[A-Za-z]{2}$/.test(trimmed)) {
      try {
        const regionNames = new Intl.DisplayNames([locale], { type: "region" });
        return regionNames.of(trimmed.toUpperCase()) || trimmed.toUpperCase();
      } catch {
        return trimmed.toUpperCase();
      }
    }

    return trimmed;
  };

  const getLocalizedLanguageName = (languageCodeOrName: string | undefined) => {
    if (!languageCodeOrName) return labels.notAvailable;

    const raw = languageCodeOrName.trim();
    if (!raw) return labels.notAvailable;

    if (/^[A-Za-z]{2,3}$/.test(raw)) {
      try {
        const languageNames = new Intl.DisplayNames([locale], { type: "language" });
        const localized = languageNames.of(raw.toLowerCase());
        return localized
          ? localized.charAt(0).toUpperCase() + localized.slice(1)
          : raw.toUpperCase();
      } catch {
        return raw.toUpperCase();
      }
    }

    if (isVietnamese && raw.toLowerCase() === "vietsub") {
      return "Phụ đề Việt";
    }

    return raw;
  };

  const getLocalizedStatus = (status: string | undefined) => {
    if (!status) return labels.unknown;

    if (!isVietnamese) return status;

    switch (status) {
      case "Released":
        return "Đã phát hành";
      case "Rumored":
        return "Tin đồn";
      case "Planned":
        return "Đã lên kế hoạch";
      case "In Production":
        return "Đang sản xuất";
      case "Post Production":
        return "Hậu kỳ";
      case "Canceled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // console.log("🎨 [MovieDetailPage] Render - State:", {
  //   loading,
  //   hasMovieData: !!movieData,
  //   movieDataTitle: movieData?.title,
  //   error,
  //   contentType,
  // });

  if (loading) {
    // console.log("⏳ [MovieDetailPage] Rendering loading skeleton");
    return (
      <Layout>
        <DetailPageSkeleton />
      </Layout>
    );
  }

  if (!movieData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error || labels.loadingContent}
          </div>
        </div>
      </Layout>
    );
  }

  // console.log("✨ [MovieDetailPage] Rendering movie detail page with data:", {
  //   id: movieData.id,
  //   title: movieData.title,
  //   contentType: movieData.contentType,
  // });

  return (
    <Layout>
      <div className="min-h-screen">
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 mx-4 rounded mb-4">
            {labels.errorPrefix} {error}
          </div>
        )}

        {/* Hero Section */}
        <div className="relative min-h-[70vh]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={movieData.backgroundImage}
              alt={`${movieData.title} backdrop`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

          <Container
            withHeaderOffset
            padding="tight"
            className="relative z-10 flex items-center min-h-[70vh] pt-18 pb-12 lg:pt-14"
          >
            <div className="flex gap-8 w-full">
              {/* Poster */}
              <div className="hidden md:block flex-shrink-0">
                <div className="relative w-64 h-96">
                  <Image
                    src={movieData.posterImage}
                    alt={movieData.title}
                    fill
                    className="object-cover rounded-lg shadow-2xl"
                    priority
                    sizes="256px"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {movieData.title}
                </h1>
                {movieData.aliasTitle &&
                  movieData.aliasTitle !== movieData.title && (
                    <h2 className="text-xl text-yellow-400 mb-6">
                      {movieData.aliasTitle}
                    </h2>
                  )}

                {/** Precompute rating once to allow zero to show */}
                {(() => {
                  const numericRating = Number(movieData.rating);
                  const hasRating =
                    Number.isFinite(numericRating) && numericRating >= 0;
                  return (
                    <div className="flex flex-wrap items-center gap-4 mb-6 text-white">
                      {hasRating && (
                        <>
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 text-yellow-500 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{numericRating.toFixed(1)}</span>
                          </div>
                          <span>&bull;</span>
                        </>
                      )}
                      <span>{movieData.year}</span>
                      <span>&bull;</span>
                      <span>{movieData.runtime}</span>
                      <span>&bull;</span>
                      <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded">
                        {movieData.quality}
                      </span>
                      {movieData.language && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded">
                          {movieData.language}
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {movieData.genres?.map((genre: string, index: number) => {
                    const genreId = movieData.genreIds?.[index];
                    if (typeof genreId !== "number") {
                      return null;
                    }
                    return (
                      <GenreBadge
                        key={`${genreId}-${index}`}
                        genre={genre}
                        genreId={genreId}
                        contentType={movieData.contentType || "movie"}
                        variant="default"
                      />
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/watch/${
                      movieData.contentType === "tv" ? "tv" : "movie"
                    }-${movieData.tmdbId || movieId}${
                      movieData.contentType === "tv"
                        ? "?season=1&episode=1"
                        : ""
                    }`}
                    onClick={() =>
                      analyticsService.trackClick(
                        String(movieData.tmdbId || movieId),
                        movieData.contentType === "tv" ? "tv_series" : "movie",
                        movieData.title
                      )
                    }
                    className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {labels.watchNow}
                  </Link>

                  <FavoriteButton
                    movie={{
                      id: movieData.id,
                      tmdbId: movieData.tmdbId,
                      title: movieData.title || labels.unknownTitle,
                      overview: movieData.description,
                      poster_path: movieData.posterImage,
                      backdrop_path: movieData.backgroundImage,
                      vote_average: movieData.rating,
                      genres: movieData.genres,
                    }}
                    className="px-8 py-4"
                  />

                  <TrailerButton
                    movieId={movieData.tmdbId || parseInt(movieId)}
                    movieTitle={movieData.title}
                    contentType={contentType || "movie"}
                    className="px-8 py-4 !rounded-lg font-semibold"
                  />
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Movie Details Section */}
        <Container padding="tight" className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-6">{labels.overview}</h3>
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <p className="text-gray-300 leading-relaxed">
                  {movieData.description}
                </p>
              </div>

              {/* Cast Section */}
              {(movieData.cast && movieData.cast.length > 0) ||
              creditsLoading ? (
                <>
                  <h3 className="text-2xl font-bold text-white mb-6">{labels.cast}</h3>
                  {creditsLoading ? (
                    <CastSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                      {movieData.cast.map(
                        (actor: CastMember, index: number) => (
                          <Link
                            key={index}
                            href={`/people/${actor.id}`}
                            className="text-center group block"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-700 relative">
                              <Image
                                src={
                                  actor.profile_path
                                    ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${actor.profile_path}`
                                    : FALLBACK_POSTER
                                }
                                alt={actor.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform cursor-pointer"
                                loading="lazy"
                                sizes="(max-width: 768px) 50vw, 25vw"
                                onError={(
                                  e: SyntheticEvent<HTMLImageElement>
                                ) => {
                                  e.currentTarget.src = "/images/no-avatar.svg";
                                }}
                              />
                            </div>
                            <h4 className="font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">
                              {actor.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {actor.character}
                            </p>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-white mb-4">{labels.contentInfo}</h3>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <span className="text-gray-500">{labels.director}</span>
                    <span className="ml-2">
                      {creditsLoading ? (
                        <span className="inline-block h-6 w-20 bg-gray-600 animate-pulse rounded" />
                      ) : movieData.director ? (
                        <Link
                          href={`/people/${movieData.director.id}`}
                          className="inline-block bg-gray-700 hover:bg-red-600 text-sm px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          {movieData.director.name}
                        </Link>
                      ) : (
                        labels.unknown
                      )}
                    </span>
                  </div>
                  {(movieData.cast && movieData.cast.length > 0) ||
                  creditsLoading ? (
                    <div>
                      <span className="text-gray-500">{labels.cast}:</span>
                      <div className="mt-1">
                        {creditsLoading ? (
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 4 }).map((_, idx) => (
                              <span
                                key={idx}
                                className="inline-block h-6 w-16 bg-gray-600 animate-pulse rounded"
                              />
                            ))}
                          </div>
                        ) : (
                          movieData.cast
                            .slice(0, 6)
                            .map((actor: CastMember, index: number) => (
                              <Link
                                key={index}
                                href={`/people/${actor.id}`}
                                className="inline-block bg-gray-700 hover:bg-red-600 text-sm px-2 py-1 rounded mr-2 mb-2 transition-colors cursor-pointer"
                              >
                                {actor.name}
                              </Link>
                            ))
                        )}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <span className="text-gray-500">{labels.country}</span>
                    <span className="ml-2">
                      {creditsLoading ? (
                        <span className="inline-block h-6 w-20 bg-gray-600 animate-pulse rounded" />
                      ) : (
                        getLocalizedCountryName(movieData.country || labels.unknown)
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">{labels.releaseYear}</span>
                    <span className="ml-2">{movieData.year}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {movieData.contentType === "tv"
                        ? labels.runtimeEpisode
                        : labels.runtime}
                    </span>
                    <span className="ml-2">{movieData.runtime}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{labels.quality}</span>
                    <span className="ml-2">{movieData.quality}</span>
                  </div>
                  {movieData.language && (
                    <div>
                      <span className="text-gray-500">{labels.language}</span>
                      <span className="ml-2">
                        {getLocalizedLanguageName(movieData.language)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">{labels.status}</span>
                    <span className="ml-2 text-green-500">
                      {getLocalizedStatus(movieData.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Recommendations Section */}
        {movieData.tmdbId && (
          <Suspense
            fallback={
              <section className="py-12 max-w-6xl mx-auto">
                <div className="container mx-auto px-4 pt-16">
                  <h2 className="text-3xl font-bold text-white mb-8">
                    {labels.youMightAlsoLike}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div key={index} className="space-y-3">
                        <div className="aspect-[2/3] bg-gray-700 rounded-lg animate-pulse"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            }
          >
            <RecommendationsSection
              tmdbId={movieData.tmdbId}
              contentType={movieData.contentType === "tv" ? "tv" : "movie"}
            />
          </Suspense>
        )}
      </div>
    </Layout>
  );
};

export default MovieDetailPageClient;
