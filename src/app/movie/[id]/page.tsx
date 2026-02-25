"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import type { SyntheticEvent } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import TrailerButton from "@/components/ui/TrailerButton";
import CastSkeleton from "@/components/ui/CastSkeleton";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import GenreBadge from "@/components/ui/GenreBadge";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import { apiService } from "@/services/api";
import { analyticsService } from "@/services/analytics.service";
import { usePageDuration } from "@/hooks/usePageDuration";
import { normalizeRatingValue } from "@/utils/rating";
import { MovieDetail, Movie, TVSeries } from "@/types/content.types";
import type { CastMember, CrewMember } from "@/types";
import { getLocalizedGenreNameById } from "@/utils/genreMapping";
import { formatWatchDuration } from "@/utils/watchContentMapper";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";

const RecommendationsSection = lazy(
  () => import("@/components/movie/RecommendationsSection")
);

const MovieDetailPageContent = () => {
  const params = useParams();
  const movieId = params.id as string;
  const { language } = useLanguage();
  const [movieData, setMovieData] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"movie" | "tv" | null>(null);

  // Track time on page
  usePageDuration({
    contentId: movieId,
    contentType: contentType === "tv" ? "tv_series" : "movie",
    contentTitle: movieData?.title,
    enabled: !!movieData && !loading,
  });

  // Component mount log (commented for production)
  // useEffect(() => {
  //   console.log("🎬 [MovieDetailPage] Component mounted with params:", params);
  //   console.log("🎬 [MovieDetailPage] Extracted movieId:", movieId);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Function to fetch credits after basic movie data is loaded
  const fetchCredits = useCallback(
    async (movieId: number) => {
      try {
        setCreditsLoading(true);
        const creditsResponse = await apiService.getMovieCredits(
          movieId,
          language
        );
        if (creditsResponse.success && creditsResponse.data) {
          const credits = creditsResponse.data;

          // Find director from crew
          const directorPerson = credits.crew?.find(
            (person: CrewMember) =>
              person.job === "Director" || person.job === "director"
          );
          const director = directorPerson
            ? {
                id: directorPerson.id,
                name: directorPerson.name,
              }
            : null;

          // Get country from production_countries
          const country = credits.production_countries?.[0]?.name || "Unknown";

          // Update movieData with credits info
          setMovieData((prevData: MovieDetail | null) => {
            if (!prevData) return prevData;
            return {
              ...prevData,
              director,
              country,
              cast:
                credits.cast?.slice(0, 10)?.map((actor: CastMember) => ({
                  id: actor.id,
                  name: actor.name,
                  character: actor.character,
                  profile_path: actor.profile_path,
                })) || [],
              runtime: credits.runtime
                ? formatWatchDuration(Number(credits.runtime), "movie")
                : prevData.runtime,
              status: credits.status || prevData.status,
            };
          });
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        // Don't show error to user for credits, just keep "Loading..." or "Unknown"
      } finally {
        setCreditsLoading(false);
      }
    },
    [language]
  );

  useEffect(() => {
    const fetchMovieData = async () => {
      // console.log("🎬 [MovieDetailPage] Starting fetchMovieData");
      // console.log("🎬 [MovieDetailPage] movieId from params:", movieId);

      try {
        setLoading(true);
        setError(null);

        const parsedTmdbId = parseInt(movieId);
        let contentResult:
          | {
              content: Movie | TVSeries | null;
              contentType: "movie" | "tv";
              success: boolean;
              message?: string;
            }
          | undefined;

        const lookupResult = await apiService.lookupByTmdbId(parsedTmdbId);

        if (lookupResult.success && lookupResult.data?.contentType === "tv") {
          contentResult = await apiService.getTVByTmdbId(parsedTmdbId, language);
        } else if (
          lookupResult.success &&
          lookupResult.data?.contentType === "movie"
        ) {
          contentResult = await apiService.getMovieByTmdbId(parsedTmdbId, language);
        } else {
          // Fallback for edge cases when lookup cannot classify content
          contentResult = await apiService.getContentById(parsedTmdbId, language);
        }

        // console.log("🎬 [MovieDetailPage] API Response:", {
        //   success: contentResult.success,
        //   contentType: contentResult.contentType,
        //   hasContent: !!contentResult.content,
        //   message: contentResult.message,
        // });

        if (!contentResult.success || !contentResult.content) {
          console.error(
            "❌ [MovieDetailPage] Content not found:",
            contentResult.message
          );
          setError(
            `Content not found with ID: ${movieId}. Please try again later or choose different content.`
          );
          return;
        }

        const content = contentResult.content;
        const isMovie = contentResult.contentType === "movie";
        // console.log("🎬 [MovieDetailPage] Content type:", contentResult.contentType);
        // console.log("🎬 [MovieDetailPage] Raw content data:", content);
        setContentType(contentResult.contentType);

        if (content) {
          if (isMovie) {
            // console.log("🎥 [MovieDetailPage] Processing MOVIE content");
            const movieContent = content as Movie;
            // Transform Backend Movie API data
            const genreNames =
              movieContent.genreIds
                ?.map((id: number) =>
                  getLocalizedGenreNameById(id, language, "movie")
                )
                .filter((name): name is string => Boolean(name)) || [];

            // console.log("🎥 [MovieDetailPage] Genre mapping:", {
            //   genreIds: movieContent.genreIds,
            //   genreNames,
            // });

            const transformedMovieData = {
              id: movieContent.id,
              title: movieContent.title,
              aliasTitle:
                movieContent.defaultTitle &&
                movieContent.defaultTitle !== movieContent.title
                  ? movieContent.defaultTitle
                  : "",
              rating: normalizeRatingValue(
                movieContent.voteAverage ??
                  (movieContent as { vote_average?: number | string })
                    .vote_average ??
                  (movieContent as unknown as Record<string, unknown>).rating
              ),
              year: movieContent.releaseDate
                ? new Date(movieContent.releaseDate).getFullYear()
                : new Date().getFullYear(),
              runtime: (movieContent as { runtime?: number }).runtime
                ? formatWatchDuration(
                    Number((movieContent as { runtime?: number }).runtime),
                    "movie"
                  )
                : "N/A",
              genres: genreNames,
              genreIds: movieContent.genreIds || [],
              description: movieContent.overview || "No description available",
              backgroundImage:
                movieContent.backdropUrl ||
                movieContent.backdropPath ||
                FALLBACK_POSTER,
              posterImage:
                movieContent.posterUrl ||
                movieContent.posterPath ||
                FALLBACK_POSTER,
              director: null,
              cast: [],
              country: "Loading...",
              status: "Released",
              quality: "HD",
              language:
                movieContent.originalLanguage === "vi"
                  ? "Vietsub"
                  : movieContent.originalLanguage?.toUpperCase() || "",
              contentType: "movie" as const,
              tmdbId: movieContent.tmdbId,
              voteCount: movieContent.voteCount,
              popularity: movieContent.popularity,
              scenes: [],
            };

            // console.log("🎥 [MovieDetailPage] Transformed movie data:", transformedMovieData);
            setMovieData(transformedMovieData);

            // Track VIEW analytics
            analyticsService.trackView(
              String(movieContent.tmdbId),
              "movie",
              movieContent.title
            );

            // Fetch credits after setting basic data
            // console.log("🎥 [MovieDetailPage] Fetching credits for tmdbId:", movieContent.tmdbId || movieContent.id);
            fetchCredits(movieContent.tmdbId || movieContent.id);
          } else {
            // console.log("📺 [MovieDetailPage] Processing TV SERIES content");
            const tvContent = content as TVSeries;
            // Transform Backend TV Series API data
            const genreNames =
              tvContent.genreIds
                ?.map((id: number) =>
                  getLocalizedGenreNameById(id, language, "tv")
                )
                .filter((name): name is string => Boolean(name)) || [];

            // console.log("📺 [MovieDetailPage] Genre mapping:", {
            //   genreIds: tvContent.genreIds,
            //   genreNames,
            // });

            const transformedTVData = {
              id: tvContent.id,
              title: tvContent.title || tvContent.originalTitle || "Untitled",
              aliasTitle:
                tvContent.originalTitle || tvContent.title || "Untitled",
              rating: normalizeRatingValue(
                tvContent.voteAverage ??
                  (tvContent as { vote_average?: number | string })
                    .vote_average ??
                  (tvContent as unknown as Record<string, unknown>).rating
              ),
              year: tvContent.firstAirDate
                ? new Date(tvContent.firstAirDate).getFullYear()
                : new Date().getFullYear(),
              runtime: tvContent.episodeRunTime?.length
                ? formatWatchDuration(tvContent.episodeRunTime[0], "tv")
                : "N/A",
              genres: genreNames,
              genreIds: tvContent.genreIds || [],
              description: tvContent.overview || "No description available",
              backgroundImage:
                tvContent.backdropUrl ||
                tvContent.backdropPath ||
                FALLBACK_POSTER,
              posterImage:
                tvContent.posterUrl || tvContent.posterPath || FALLBACK_POSTER,
              director: null,
              cast: [],
              country: "Loading...",
              status: tvContent.status || "Returning Series",
              quality: "HD",
              language:
                tvContent.originalLanguage === "vi"
                  ? "Vietsub"
                  : tvContent.originalLanguage?.toUpperCase() || "",
              contentType: "tv" as const,
              tmdbId: tvContent.tmdbId,
              voteCount: tvContent.voteCount,
              popularity: tvContent.popularity,
              scenes: [],
            };

            // console.log("📺 [MovieDetailPage] Transformed TV data:", transformedTVData);
            setMovieData(transformedTVData);

            // Track VIEW analytics
            analyticsService.trackView(
              String(tvContent.tmdbId),
              "tv_series",
              (tvContent.title || tvContent.originalTitle) ?? undefined
            );

            // Fetch credits for TV shows (not implemented yet, but structure is ready)
            // fetchTVCredits(content.tmdbId || content.id);
          }
        } else {
          // console.log("⚠️ [MovieDetailPage] No content data returned");
          throw new Error(
            contentResult.message || "Failed to fetch content data"
          );
        }
      } catch (err) {
        console.error("❌ [MovieDetailPage] Error in fetchMovieData:", err);
        console.error("❌ [MovieDetailPage] Error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        });
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        // console.log("✅ [MovieDetailPage] fetchMovieData completed");
        setLoading(false);
      }
    };

    // console.log("🚀 [MovieDetailPage] useEffect triggered, movieId:", movieId);
    if (movieId) {
      fetchMovieData();
    } else {
      console.warn("⚠️ [MovieDetailPage] No movieId provided");
    }
  }, [movieId, language, fetchCredits]);

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
    notFound();
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
            Error: {error}
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
                    Watch Now
                  </Link>

                  <FavoriteButton
                    movie={{
                      id: movieData.id,
                      tmdbId: movieData.tmdbId,
                      title: movieData.title || "Unknown Title",
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
              <h3 className="text-2xl font-bold text-white mb-6">Overview</h3>
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <p className="text-gray-300 leading-relaxed">
                  {movieData.description}
                </p>
              </div>

              {/* Cast Section */}
              {(movieData.cast && movieData.cast.length > 0) ||
              creditsLoading ? (
                <>
                  <h3 className="text-2xl font-bold text-white mb-6">Cast</h3>
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
                <h3 className="text-xl font-bold text-white mb-4">
                  Movie Info
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <span className="text-gray-500">Director:</span>
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
                        "Unknown"
                      )}
                    </span>
                  </div>
                  {(movieData.cast && movieData.cast.length > 0) ||
                  creditsLoading ? (
                    <div>
                      <span className="text-gray-500">Cast:</span>
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
                    <span className="text-gray-500">Country:</span>
                    <span className="ml-2">
                      {creditsLoading ? (
                        <span className="inline-block h-6 w-20 bg-gray-600 animate-pulse rounded" />
                      ) : (
                        movieData.country || "Unknown"
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Release Year:</span>
                    <span className="ml-2">{movieData.year}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {movieData.contentType === "tv"
                        ? "Runtime/Episode:"
                        : "Runtime:"}
                    </span>
                    <span className="ml-2">{movieData.runtime}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quality:</span>
                    <span className="ml-2">{movieData.quality}</span>
                  </div>
                  {movieData.language && (
                    <div>
                      <span className="text-gray-500">Language:</span>
                      <span className="ml-2">{movieData.language}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 text-green-500">
                      {movieData.status}
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
                    You Might Also Like
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

export default MovieDetailPageContent;
