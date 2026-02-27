"use client";

import { lazy, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import GenreBadge from "@/components/ui/GenreBadge";
import EpisodePicker from "@/components/ui/EpisodePicker";
import { useWatchPage } from "@/hooks/pages/useWatchPage";
import type { WatchContentData } from "@/utils/watchContentMapper";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";
import type { CastMember } from "@/types";
import {
  type WatchPageCredits,
  type WatchPageRecommendationItem,
} from "@/lib/page-data.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { getWatchPageUiMessages } from "@/lib/ui-messages";

const CommentSection = lazy(() =>
  import("@/components/comments/CommentSection").then((m) => ({
    default: m.CommentSection,
  }))
);

interface WatchPageClientProps {
  movieId: string;
  initialLanguage: string;
  initialMovieData: WatchContentData | null;
  initialCredits: WatchPageCredits | null;
  initialRecommendations: WatchPageRecommendationItem[];
  initialStreamCandidates: string[];
  initialStreamError: string | null;
  initialError: string | null;
  initialSeason: number;
  initialEpisode: number;
}

const isSafeEmbedStreamUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const WatchPageClient = ({
  movieId,
  initialLanguage,
  initialMovieData,
  initialCredits,
  initialRecommendations,
  initialStreamCandidates,
  initialStreamError,
  initialError,
  initialSeason,
  initialEpisode,
}: WatchPageClientProps) => {
  const { language } = useLanguage();
  const labels = getWatchPageUiMessages(language);

  const {
    movieData,
    loading,
    error,
    isPlaying,
    credits,
    recommendations,
    creditsLoading,
    recommendationsLoading,
    season,
    episode,
    streamCandidates,
    activeStreamIndex,
    streamError,
    activeStreamUrl,
    formattedDuration,
    hasDuration,
    numericRating,
    hasRating,
    episodePickerSeasons,
    handlePlayMovie,
    handleStreamLoadError,
    handleStreamLoadSuccess,
  } = useWatchPage({
    movieId,
    initialLanguage,
    initialMovieData,
    initialCredits,
    initialRecommendations,
    initialStreamCandidates,
    initialStreamError,
    initialError,
    initialSeason,
    initialEpisode,
  });

  if (loading) {
    return (
      <Layout>
        <DetailPageSkeleton />
      </Layout>
    );
  }

  if (error || !movieData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error || labels.unableToLoad}
          </div>
        </div>
      </Layout>
    );
  }

  const hasUnsafeActiveStreamUrl =
    typeof activeStreamUrl === "string" &&
    activeStreamUrl.length > 0 &&
    !isSafeEmbedStreamUrl(activeStreamUrl);
  const safeActiveStreamUrl = hasUnsafeActiveStreamUrl ? null : activeStreamUrl;
  const unsafeStreamMessage = language.startsWith("vi")
    ? "Nguồn phát bị chặn vì URL không an toàn."
    : "Stream source was blocked due to an unsafe URL.";

  return (
    <Layout hideHeaderOnPlay={true} isPlaying={isPlaying}>
      <div className="min-h-screen bg-gray-900">
        {/* Movie Player Section */}
        <div className="relative flex items-center justify-center bg-black">
          <div className="w-full aspect-video max-h-[100vh] min-h-[240px] sm:min-h-[320px] flex items-center justify-center">
            {isPlaying ? (
              safeActiveStreamUrl ? (
                <div className="relative w-full h-full">
                  <iframe
                    key={safeActiveStreamUrl}
                    src={safeActiveStreamUrl}
                    className="w-full h-full"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    onLoad={handleStreamLoadSuccess}
                    onError={handleStreamLoadError}
                  />
                  {activeStreamIndex > 0 && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/70 text-xs text-white">
                      {labels.fallbackSource} {activeStreamIndex + 1}/
                      {streamCandidates.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black px-6">
                  {streamError ? (
                    <p className="text-gray-300 text-center">{streamError}</p>
                  ) : hasUnsafeActiveStreamUrl ? (
                    <p className="text-gray-300 text-center">
                      {unsafeStreamMessage}
                    </p>
                  ) : null}
                </div>
              )
            ) : (
              // Movie Poster with Play Button
              <div
                className="relative w-full h-full cursor-pointer"
                onClick={handlePlayMovie}
              >
                <Image
                  src={movieData.backgroundImage}
                  alt={movieData.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="w-24 h-24 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all transform hover:scale-110 group">
                    <svg
                      className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Episode Picker - TV Series only */}
        {movieData.contentType === "tv" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <EpisodePicker
              tmdbId={movieData.tmdbId}
              numberOfSeasons={episodePickerSeasons}
              currentSeason={season}
              currentEpisode={episode}
              contentId={movieId}
            />
          </div>
        )}

        {/* Movie Information */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="wm-info grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Poster */}
                <div className="v-thumb-l lg:col-span-1">
                  <div className="v-thumbnail aspect-[2/3] relative rounded-xl overflow-hidden bg-gray-800 group">
                    <Image
                      src={movieData.posterImage}
                      alt={`Xem Phim ${movieData.title} Vietsub HD Online`}
                      fill
                      className="object-cover"
                    />
                    {/* Heart/Favorite Button */}
                    <FavoriteButton
                      movie={{
                        id: movieData.tmdbId,
                        title: movieData.title,
                        poster_path:
                          movieData.posterImage || movieData.backgroundImage,
                        vote_average: movieData.rating || 0,
                        media_type: movieData.contentType || "movie",
                        overview: movieData.description,
                        genres:
                          movieData.genres?.map((genre) => ({
                            id: 0,
                            name: genre,
                          })) || [],
                      }}
                      iconOnly={true}
                      className="!absolute !top-3 !right-3 !w-10 !h-10 !p-0 !rounded-full hover:!scale-110"
                    />
                  </div>
                </div>

                {/* Movie Details */}
                <div className="info lg:col-span-3 space-y-6">
                  <div>
                    <h2 className="heading-sm media-name text-4xl font-bold text-white mb-2">
                      <Link
                        title={movieData.title}
                        href={`/${
                          movieData.contentType === "tv" ? "tv" : "movie"
                        }/${movieData.tmdbId}`}
                        className="text-white hover:text-red-500"
                      >
                        {movieData.title}
                      </Link>
                    </h2>
                    {movieData.aliasTitle &&
                      movieData.aliasTitle !== movieData.title && (
                        <div className="alias-name text-xl text-gray-400 mb-2">
                          {movieData.aliasTitle}
                        </div>
                      )}

                    <div className="detail-more mb-4">
                      <div className="hl-tags flex flex-wrap items-center gap-2 mb-2">
                        <div className="tag-classic">
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              movieData.contentType === "tv"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {movieData.contentType === "tv"
                              ? labels.tvSeries
                              : labels.movie}
                          </span>
                        </div>
                        <div className="tag-classic">
                          <span className="text-white px-2 py-1 rounded text-sm">
                            {movieData.year}
                          </span>
                        </div>
                        {hasDuration && formattedDuration && (
                          <div className="tag-classic">
                            <span className="text-white px-2 py-1 rounded text-sm">
                              {formattedDuration}
                            </span>
                          </div>
                        )}
                        {hasRating && (
                          <div className="flex items-center gap-1 bg-yellow-500 text-black px-2 py-1 rounded text-sm">
                            <svg
                              className="w-3 h-3 fill-current"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{numericRating.toFixed(1)}</span>
                          </div>
                        )}

                        {/* TV Series specific info */}
                        {movieData.contentType === "tv" && (
                          <>
                            {movieData.numberOfSeasons && (
                              <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">
                                {movieData.numberOfSeasons}{" "}
                                {movieData.numberOfSeasons > 1
                                  ? labels.seasons
                                  : labels.season}
                              </span>
                            )}
                            {movieData.numberOfEpisodes && (
                              <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">
                                {movieData.numberOfEpisodes}{" "}
                                {movieData.numberOfEpisodes > 1
                                  ? labels.episodes
                                  : labels.episode}
                              </span>
                            )}
                            {movieData.status && (
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  movieData.status === "Ended"
                                    ? "bg-red-600 text-white"
                                    : movieData.status === "Returning Series"
                                    ? "bg-green-600 text-white"
                                    : "bg-orange-600 text-white"
                                }`}
                              >
                                {movieData.status}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Genres */}
                      {movieData.genres.length > 0 && (
                        <div className="hl-tags flex flex-wrap gap-2">
                        {movieData.genres.map((genre, index) => {
                          const genreId = movieData.genreIds?.[index];
                          if (typeof genreId !== "number") {
                            return null;
                          }
                          return (
                            <GenreBadge
                              key={`${genreId}-${index}`}
                              genre={genre}
                              genreId={genreId}
                              contentType={movieData.contentType}
                              className="bg-gray-600 hover:text-red-400"
                              variant="hero"
                            />
                          );
                        })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="desc-line">
                    <div className="description lim-3 text-gray-300 leading-relaxed mb-4">
                      {movieData.description}
                    </div>

                    {/* TV Series Creators */}
                    {movieData.contentType === "tv" &&
                      movieData.created_by &&
                      movieData.created_by.length > 0 && (
                        <div className="creators mb-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">
                            {labels.createdBy}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {movieData.created_by.map((creator, index) => (
                              <span
                                key={creator.id}
                                className="text-gray-300 text-sm"
                              >
                                {creator.name}
                                {index < movieData.created_by!.length - 1 &&
                                  ", "}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    <Link
                      className="text-primary text-red-500 hover:text-red-400 inline-flex items-center"
                      href={`/${
                        movieData.contentType === "tv" ? "tv" : "movie"
                      }/${movieData.tmdbId}`}
                    >
                      {movieData.contentType === "tv"
                        ? labels.seriesInfo
                        : labels.movieInfo}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Comment Section */}
              <div className="mt-12">
                <Suspense
                  fallback={
                    <div className="bg-gray-800 rounded-lg p-8">
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
                        <div className="space-y-4">
                          <div className="h-24 bg-gray-700 rounded"></div>
                          <div className="h-24 bg-gray-700 rounded"></div>
                          <div className="h-24 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <CommentSection
                    movieId={
                      movieData.contentType === "movie"
                        ? movieData.tmdbId
                        : undefined
                    }
                    tvSeriesId={
                      movieData.contentType === "tv"
                        ? movieData.tmdbId
                        : undefined
                    }
                  />
                </Suspense>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="lg:col-span-1 space-y-8">
              {/* Cast & Crew */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {labels.cast}
                </h3>
                {creditsLoading ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : credits?.cast && credits.cast.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {credits.cast.slice(0, 9).map((actor: CastMember) => (
                      <div key={actor.id} className="text-center">
                        <Link href={`/people/${actor.id}`} className="block mb-2">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 mx-auto">
                            {actor.profile_path ? (
                              <Image
                                src={
                                  actor.profile_path
                                    ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${actor.profile_path}`
                                    : FALLBACK_POSTER
                                }
                                alt={actor.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg
                                  className="w-6 h-6"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </Link>
                        <h4 className="text-white text-xs font-medium leading-tight">
                          <Link
                            href={`/people/${actor.id}`}
                            className="hover:text-red-400 transition-colors"
                          >
                            {actor.name}
                          </Link>
                        </h4>
                        {actor.character && (
                          <p className="text-gray-400 text-xs mt-1 truncate">
                            {actor.character}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    {labels.noCast}
                  </p>
                )}
              </div>

              {/* Recommendations */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {labels.youMayAlsoLike}
                </h3>
                {recommendationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-16 h-24 bg-gray-700 rounded animate-pulse flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded animate-pulse mb-1"></div>
                          <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((item: WatchPageRecommendationItem) => (
                      <Link
                        key={item.id}
                        href={`/${
                          movieData.contentType === "tv" ? "tv" : "movie"
                        }/${item.id}`}
                        className="flex space-x-3 hover:bg-gray-700 rounded-lg p-2 transition-colors group"
                      >
                        <div className="w-16 h-24 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                          {item.poster_path ? (
                            <Image
                              src={
                                item.poster_path
                                  ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${item.poster_path}`
                                  : FALLBACK_POSTER
                              }
                              alt={item.title || item.name || labels.posterAltFallback}
                              width={64}
                              height={96}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg
                                className="w-8 h-8"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium truncate group-hover:text-red-400">
                            {item.title || item.name}
                          </h4>
                          <p className="text-gray-400 text-xs mb-1">
                            {item.release_date || item.first_air_date
                              ? new Date(
                                  item.release_date || item.first_air_date || ""
                                ).getFullYear()
                              : labels.notAvailable}
                          </p>
                          {item.vote_average &&
                            parseFloat(String(item.vote_average)) > 0 && (
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3 text-yellow-500 fill-current"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-yellow-500 text-xs">
                                  {item.vote_average.toFixed(1)}
                                </span>
                              </div>
                            )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    {labels.noRecommendations}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WatchPageClient;
