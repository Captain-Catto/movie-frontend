"use client";

import { useState, Suspense, lazy } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import TrailerButton from "@/components/ui/TrailerButton";
import CastSkeleton from "@/components/ui/CastSkeleton";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import type { TVDetail } from "@/types/content.types";
import RatingBadge from "@/components/ui/RatingBadge";
import GenreBadge from "@/components/ui/GenreBadge";
import { useTVDetailPageClient } from "@/hooks/pages/useTVDetailPageClient";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  TMDB_BACKDROP_SIZE,
  FALLBACK_POSTER,
  getLocaleFromLanguage,
} from "@/constants/app.constants";

const RecommendationsSection = lazy(
  () => import("@/components/movie/RecommendationsSection")
);

interface TVDetailPageClientProps {
  tvIdParam: string;
  initialLanguage: string;
  initialTVData: TVDetail | null;
  initialError: string | null;
}

const TVDetailPageClient = ({
  tvIdParam,
  initialLanguage,
  initialTVData,
  initialError,
}: TVDetailPageClientProps) => {
  const numericTvId = Number(tvIdParam);
  const { tvData, loading, creditsLoading, error, language } =
    useTVDetailPageClient({
    tvIdParam,
    initialLanguage,
    initialTVData,
    initialError,
  });
  const locale = getLocaleFromLanguage(language);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Helper functions
  const isLocalFallback = (path: string | null) =>
    !path || path === FALLBACK_POSTER || path.startsWith("/images/");

  const getPosterUrl = (posterPath: string | null) => {
    if (isLocalFallback(posterPath)) return FALLBACK_POSTER;
    if (!posterPath) return FALLBACK_POSTER;
    if (posterPath.startsWith("http")) return posterPath;
    return `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${posterPath}`;
  };

  const getBackdropUrl = (backdropPath: string | null) => {
    if (isLocalFallback(backdropPath)) return FALLBACK_POSTER;
    if (!backdropPath) return FALLBACK_POSTER;
    if (backdropPath.startsWith("http")) return backdropPath;
    return `${TMDB_IMAGE_BASE_URL}/${TMDB_BACKDROP_SIZE}${backdropPath}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(locale);
  };

  const formatRuntime = (runtimes: number[]) => {
    if (!runtimes || runtimes.length === 0) return "N/A";
    const avgRuntime = Math.round(
      runtimes.reduce((a, b) => a + b, 0) / runtimes.length
    );
    return `${avgRuntime} min/ep`;
  };

  if (loading) {
    return (
      <Layout>
        <DetailPageSkeleton />
      </Layout>
    );
  }

  if (error || !tvData) {
    notFound();
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[70vh] lg:pt-16 md:pt-20 pt-18">
          <div className="absolute inset-0">
            <Image
              src={getBackdropUrl(tvData.backdropPath)}
              alt={tvData.title}
              fill
              className="object-cover"
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDHPKw8HFBcZLEEEEEEEgUCFQKBQQVBA
"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          <div className="relative max-w-6xl mx-auto px-3 sm:px-4 z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 lg:gap-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-72 sm:w-56 sm:h-84 md:w-64 md:h-96 lg:w-72 lg:h-108">
                  <Image
                    src={getPosterUrl(tvData.posterPath)}
                    alt={tvData.title}
                    fill
                    className="object-cover rounded-lg shadow-2xl"
                    priority
                    sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 288px"
                  />
                </div>
              </div>

              {/* TV Info */}
              <div className="flex-1 text-center md:text-left min-w-0 w-full md:w-auto">
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 drop-shadow-lg break-words">
                  {tvData.title}
                </h1>
                {tvData.originalTitle !== tvData.title && (
                  <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-300 mb-2 sm:mb-3 md:mb-4 break-words">
                    {tvData.originalTitle}
                  </p>
                )}

                {/* Rating and Info */}
                <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
                  <RatingBadge
                    rating={tvData.voteAverage}
                    variant="badge"
                    showZero={true}
                  />
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold">
                    TV Series
                  </span>
                  <span className="text-gray-300">
                    {formatDate(tvData.firstAirDate)}
                  </span>
                  {tvData.episodeRunTime &&
                    tvData.episodeRunTime.length > 0 && (
                      <span className="text-gray-300">
                        {formatRuntime(tvData.episodeRunTime)}
                      </span>
                    )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap justify-start gap-2 mb-4 sm:mb-6 md:mb-8">
                  {tvData.genres.map((genre: string, index: number) => {
                    const genreId = tvData.genreIds?.[index];
                    if (typeof genreId !== "number") {
                      return null;
                    }
                    return (
                      <GenreBadge
                        key={`${genreId}-${index}`}
                        genre={genre}
                        genreId={genreId}
                        contentType="tv"
                        variant="detail"
                      />
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                  <Link
                    href={`/watch/tv-${tvData.tmdbId || numericTvId}?season=1&episode=1`}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base font-semibold rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Watch Series
                  </Link>

                  <FavoriteButton
                    movie={{
                      id: tvData.tmdbId,
                      tmdbId: tvData.tmdbId,
                      title: tvData.title,
                      overview: tvData.overview,
                      poster_path: tvData.posterPath,
                      vote_average: tvData.voteAverage,
                      media_type: "tv",
                      genres: tvData.genres,
                    }}
                    className="!px-3 !py-1.5 sm:!px-4 sm:!py-2 md:!px-5 md:!py-2.5 !rounded-lg !font-semibold !text-sm sm:!text-base"
                  />

                  <TrailerButton
                    movieId={tvData.tmdbId || numericTvId}
                    movieTitle={tvData.title}
                    contentType="tv"
                    className="!px-3 !py-1.5 sm:!px-4 sm:!py-2 md:!px-5 md:!py-2.5 !rounded-lg !font-semibold !text-sm sm:!text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TV Details Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-6">Overview</h3>
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <p className="text-gray-300 leading-relaxed">
                  {tvData.overview ? (
                    showFullDescription || tvData.overview.length <= 300 ? (
                      tvData.overview
                    ) : (
                      <>
                        {tvData.overview.substring(0, 300)}...
                        <button
                          onClick={() => setShowFullDescription(true)}
                          className="ml-2 text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
                        >
                          Read more
                        </button>
                      </>
                    )
                  ) : (
                    "No description available."
                  )}
                </p>
                {showFullDescription &&
                  tvData.overview &&
                  tvData.overview.length > 300 && (
                    <button
                      onClick={() => setShowFullDescription(false)}
                      className="mt-2 text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
                    >
                      Show less
                    </button>
                  )}
              </div>

              {/* Cast Section */}
              {(tvData.cast && tvData.cast.length > 0) || creditsLoading ? (
                <>
                  <h3 className="text-2xl font-bold text-white mb-6">Cast</h3>
                  {creditsLoading ? (
                    <CastSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                      {tvData.cast.slice(0, 10).map((actor) => (
                        <Link
                          key={actor.id}
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
                            />
                          </div>
                          <h4 className="font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">
                            {actor.name}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {actor.character}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  Series Info
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <span className="text-gray-500">Created by:</span>
                    <div className="mt-1">
                      {tvData.createdBy && tvData.createdBy.length > 0 ? (
                        tvData.createdBy.map((creator, index: number) => (
                          <Link
                            key={creator.id || index}
                            href={`/people/${creator.id}`}
                            className="inline-block bg-gray-700 hover:bg-red-600 text-sm px-2 py-1 rounded mr-2 mb-1 transition-colors cursor-pointer"
                          >
                            {creator.name}
                          </Link>
                        ))
                      ) : creditsLoading ? (
                        <span className="animate-pulse bg-gray-600 rounded px-2 py-1">
                          Loading...
                        </span>
                      ) : tvData.creator ? (
                        <Link
                          href={`/people/${tvData.creator.id}`}
                          className="inline-block bg-gray-700 hover:bg-red-600 text-sm px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          {tvData.creator.name}
                        </Link>
                      ) : (
                        "Unknown"
                      )}
                    </div>
                  </div>
                  {(tvData.cast && tvData.cast.length > 0) || creditsLoading ? (
                    <div>
                      <span className="text-gray-500">Cast:</span>
                      <div className="mt-1">
                        {creditsLoading ? (
                          <span className="animate-pulse bg-gray-600 rounded px-2 py-1">
                            Loading...
                          </span>
                        ) : (
                          tvData.cast
                            .slice(0, 6)
                            .map((actor, index: number) => (
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
                    <span className="text-gray-500">Country:</span>
                    <div className="mt-1">
                      {tvData.productionCountries &&
                      tvData.productionCountries.length > 0 ? (
                        tvData.productionCountries.map(
                          (country, index: number) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-700 text-sm px-2 py-1 rounded mr-2 mb-1"
                            >
                              {country.name || country.iso_3166_1}
                            </span>
                          )
                        )
                      ) : tvData.originCountry &&
                        tvData.originCountry.length > 0 ? (
                        tvData.originCountry.map(
                          (country: string, index: number) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-700 text-sm px-2 py-1 rounded mr-2 mb-1"
                            >
                              {country}
                            </span>
                          )
                        )
                      ) : creditsLoading ? (
                        <span className="animate-pulse bg-gray-600 rounded px-2 py-1">
                          Loading...
                        </span>
                      ) : (
                        tvData.country || "Unknown"
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">First Air Date:</span>
                    <span className="ml-2">
                      {formatDate(tvData.firstAirDate)}
                    </span>
                  </div>
                  {tvData.lastAirDate && (
                    <div>
                      <span className="text-gray-500">Last Air Date:</span>
                      <span className="ml-2">
                        {formatDate(tvData.lastAirDate)}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-500">Seasons:</span>
                    <span className="ml-2">
                      {tvData.numberOfSeasons || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Episodes:</span>
                    <span className="ml-2">
                      {tvData.numberOfEpisodes || "N/A"}
                    </span>
                  </div>
                  {tvData.episodeRunTime &&
                    tvData.episodeRunTime.length > 0 && (
                      <div>
                        <span className="text-gray-500">Runtime/Episode:</span>
                        <span className="ml-2">
                          {formatRuntime(tvData.episodeRunTime)}
                        </span>
                      </div>
                    )}
                  <div>
                    <span className="text-gray-500">Language:</span>
                    <span className="ml-2">
                      {tvData.originalLanguage?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 text-green-500">
                      {tvData.status === "Returning Series"
                        ? "On Air"
                        : tvData.status === "Ended"
                        ? "Ended"
                        : tvData.status === "Canceled"
                        ? "Canceled"
                        : tvData.status === "In Production"
                        ? "In Production"
                        : tvData.status || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {tvData.tmdbId && (
          <Suspense
            fallback={
              <section className="py-12 max-w-6xl mx-auto">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-bold text-white mb-8">
                    You May Also Like
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
            <RecommendationsSection tmdbId={tvData.tmdbId} contentType="tv" />
          </Suspense>
        )}
      </div>
    </Layout>
  );
};

export default TVDetailPageClient;
