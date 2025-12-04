"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import TrailerButton from "@/components/ui/TrailerButton";
import CastSkeleton from "@/components/ui/CastSkeleton";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import { apiService } from "@/services/api";
import { normalizeRatingValue } from "@/utils/rating";
import {
  MovieDetail,
  Movie,
  TVSeries,
} from "@/types/movie";
import type { CastMember, CrewMember } from "@/types";
import { TMDB_ENGLISH_GENRE_MAP } from "@/types/genre";

const RecommendationsSection = lazy(
  () => import("@/components/movie/RecommendationsSection")
);

const MovieDetailPageContent = () => {
  const params = useParams();
  const movieId = params.id as string;
  const [movieData, setMovieData] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"movie" | "tv" | null>(null);

  // Function to fetch credits after basic movie data is loaded
  const fetchCredits = async (movieId: number, isMovie: boolean = true) => {
    try {
      setCreditsLoading(true);
      console.log(
        `Fetching credits for ${isMovie ? "movie" : "tv"} ID: ${movieId}`
      );

      const creditsResponse = await apiService.getMovieCredits(movieId);
      if (creditsResponse.success && creditsResponse.data) {
        const credits = creditsResponse.data;

        // Find director from crew
        const directorPerson = credits.crew?.find(
          (person: CrewMember) => person.job === "Director" || person.job === "director"
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
          runtime: credits.runtime?.toString() || prevData.runtime,
          status: credits.status || prevData.status,
        };
        });

        console.log("Credits loaded successfully:", {
          director,
          country,
          castCount: credits.cast?.length || 0,
          crewCount: credits.crew?.length || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      // Don't show error to user for credits, just keep "Loading..." or "Unknown"
    } finally {
      setCreditsLoading(false);
    }
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Backend now uses TMDB ID by default, so use unified content detection
        console.log(
          `Fetching content for ID ${movieId} (now treated as TMDB ID by backend)`
        );
        const contentResult = await apiService.getContentById(
          parseInt(movieId)
        );

        if (!contentResult.success || !contentResult.content) {
          console.error("Content not found:", contentResult.message);
          setError(
            `Content not found with ID: ${movieId}. Please try again later or choose different content.`
          );
          return;
        }

        const content = contentResult.content;
        const isMovie = contentResult.contentType === "movie";
        setContentType(contentResult.contentType);

        if (content) {
          if (isMovie) {
            const movieContent = content as Movie;
            // Transform Backend Movie API data
            const genreNames =
              movieContent.genreIds
                ?.map((id: number) => TMDB_ENGLISH_GENRE_MAP[id])
                .filter(Boolean) || [];

            setMovieData({
              id: movieContent.id,
              title: movieContent.title,
              aliasTitle: movieContent.title || movieContent.title,
              rating: normalizeRatingValue(
                movieContent.voteAverage ??
                  (movieContent as { vote_average?: number | string }).vote_average ??
                  (movieContent as unknown as Record<string, unknown>).rating
              ),
              year: movieContent.releaseDate
                ? new Date(movieContent.releaseDate).getFullYear()
                : new Date().getFullYear(),
              runtime: "N/A",
              genres: genreNames,
              genreIds: movieContent.genreIds || [],
              description:
                movieContent.overview || "No description available",
              backgroundImage:
                movieContent.backdropUrl ||
                movieContent.backdropPath ||
                "/images/no-poster.svg",
              posterImage:
                movieContent.posterUrl ||
                movieContent.posterPath ||
                "/images/no-poster.svg",
              director: null,
              cast: [],
              country: "Loading...",
              status: "Released",
              quality: "HD",
              language:
                movieContent.originalLanguage === "vi"
                  ? "Vietsub"
                  : movieContent.originalLanguage?.toUpperCase() || "",
              contentType: "movie",
              tmdbId: movieContent.tmdbId,
              voteCount: movieContent.voteCount,
              popularity: movieContent.popularity,
              scenes: [],
            });

            // Fetch credits after setting basic data
            fetchCredits(movieContent.tmdbId || movieContent.id, true);
          } else {
            const tvContent = content as TVSeries;
            // Transform Backend TV Series API data
            const genreNames =
              tvContent.genreIds
                ?.map((id: number) => TMDB_ENGLISH_GENRE_MAP[id])
                .filter(Boolean) || [];

            setMovieData({
              id: tvContent.id,
              title:
                tvContent.title ||
                tvContent.originalTitle ||
                "Untitled",
              aliasTitle:
                tvContent.originalTitle ||
                tvContent.title ||
                "Untitled",
              rating: normalizeRatingValue(
                tvContent.voteAverage ??
                  (tvContent as { vote_average?: number | string }).vote_average ??
                  (tvContent as unknown as Record<string, unknown>).rating
              ),
              year: tvContent.firstAirDate
                ? new Date(tvContent.firstAirDate).getFullYear()
                : new Date().getFullYear(),
              runtime: tvContent.episodeRunTime?.length
                ? `${tvContent.episodeRunTime[0]}m/ep`
                : "N/A",
              genres: genreNames,
              genreIds: tvContent.genreIds || [],
              description: tvContent.overview || "No description available",
              backgroundImage:
                tvContent.backdropUrl ||
                tvContent.backdropPath ||
                "/images/no-poster.svg",
              posterImage:
                tvContent.posterUrl ||
                tvContent.posterPath ||
                "/images/no-poster.svg",
              director: null,
              cast: [],
              country: "Loading...",
              status: tvContent.status || "Returning Series",
              quality: "HD",
              language:
                tvContent.originalLanguage === "vi"
                  ? "Vietsub"
                  : tvContent.originalLanguage?.toUpperCase() || "",
              contentType: "tv",
              tmdbId: tvContent.tmdbId,
              voteCount: tvContent.voteCount,
              popularity: tvContent.popularity,
              scenes: [],
            });

            // Fetch credits for TV shows (not implemented yet, but structure is ready)
            // fetchTVCredits(content.tmdbId || content.id);
          }
        } else {
          throw new Error(
            contentResult.message || "Failed to fetch content data"
          );
        }
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError(err instanceof Error ? err.message : "An error occurred");

        // Fallback to mock data
        setMovieData({
          id: parseInt(movieId),
          title: "Mùa Hè Kinh Hãi",
          aliasTitle: "I Know What You Did Last Summer",
          rating: 7.2,
          year: 2025,
          runtime: "1h 51m",
          genres: ["Chiếu Rạp", "Gay Cấn", "Kinh Dị", "Bí Ẩn", "Tâm Lý"],
          description:
            "Khi năm người bạn vô tình gây ra một vụ tai nạn xe hơi chết người, họ quyết định che giấu và lập một giao ước giữ bí mật thay vì phải đối mặt với hậu quả.",
          backgroundImage:
            "https://static.nutscdn.com/vimg/1920-0/d8a4ebcb52a0c7b9769298a843a355e6.webp",
          posterImage:
            "https://static.nutscdn.com/vimg/0-260/5ced6fb31801f8d66238cbdfaa23136d.webp",
          director: { id: 1, name: "Mike Flanagan" },
          cast: [
            { id: 1, name: "Madison Iseman", character: "Main Character", profile_path: null },
            { id: 2, name: "Bill Heck", character: "Supporting", profile_path: null },
            { id: 3, name: "Brianne Tju", character: "Supporting", profile_path: null },
            { id: 4, name: "Ezekiel Goodman", character: "Supporting", profile_path: null },
          ],
          country: "Mỹ",
          status: "Completed",
          quality: "4K",
          language: "Vietsub",
          scenes: [
            "https://static.nutscdn.com/vimg/150-0/d8a4ebcb52a0c7b9769298a843a355e6.webp",
            "https://static.nutscdn.com/vimg/150-0/29cca985f832ea53a5cefa528fa7f666.webp",
            "https://static.nutscdn.com/vimg/150-0/b83f91db6c94d70423914163dc77feae.jpg",
            "https://static.nutscdn.com/vimg/150-0/7fb03fc7adc8de125e80bc0d67d0e841.webp",
          ],
          tmdbId: parseInt(movieId),
          genreIds: [27, 9648, 53], // Horror, Mystery, Thriller
          contentType: "movie",
          voteCount: 1234,
          popularity: 85.5,
        });
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);

  if (loading) {
    return (
      <Layout>
        <DetailPageSkeleton />
      </Layout>
    );
  }

  if (!movieData) {
    return (
      <Layout>
        <div className="min-h-screen">
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-white">
              <p>Movie information not found.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 mx-4 rounded mb-4">
            Error: {error}
          </div>
        )}

        {/* Hero Section */}
        <div className="relative h-[70vh] lg:pt-16 md:pt-36 pt-32">
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

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="flex gap-8 w-full">
              {/* Poster */}
              <div className="hidden md:block flex-shrink-0">
                <div className="relative w-64 h-96">
                  <Image
                    src={movieData.posterImage}
                    alt={movieData.title}
                    fill
                    className="object-cover rounded-lg shadow-2xl"
                    loading="lazy"
                    sizes="256px"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {movieData.title}
                </h1>
                <h2 className="text-xl text-yellow-400 mb-6">
                  {movieData.aliasTitle}
                </h2>

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
                    return (
                      <Link
                        key={index}
                        href={`/browse?type=movie&genres=${
                          genreId || encodeURIComponent(genre)
                        }`}
                        className="px-3 py-1 bg-gray-800/60 text-white text-sm rounded-full hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      >
                        {genre}
                      </Link>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/watch/movie-${movieData.tmdbId || movieId}`}
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
                    className="!rounded-none px-8 py-4"
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
          </div>
        </div>

        {/* Movie Details Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-6">
                Overview
              </h3>
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <p className="text-gray-300 leading-relaxed">
                  {movieData.description}
                </p>
              </div>

              {/* Cast Section */}
              {(movieData.cast && movieData.cast.length > 0) ||
              creditsLoading ? (
                <>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Cast
                  </h3>
                  {creditsLoading ? (
                    <CastSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                      {movieData.cast.map((actor: CastMember, index: number) => (
                        <Link
                          key={index}
                          href={`/people/${actor.id}`}
                          className="text-center group block"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-700 relative">
                            <Image
                              src={
                                actor.profile_path
                                  ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                                  : "/images/no-avatar.svg"
                              }
                              alt={actor.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform cursor-pointer"
                              loading="lazy"
                              sizes="(max-width: 768px) 50vw, 25vw"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/images/no-avatar.svg";
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
                  Movie Info
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <span className="text-gray-500">Director:</span>
                    <span className="ml-2">
                      {creditsLoading ? (
                        <span className="animate-pulse bg-gray-600 rounded px-2 py-1">
                          Loading...
                        </span>
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
                          <span className="animate-pulse bg-gray-600 rounded px-2 py-1">
                            Loading...
                          </span>
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
                        <span className="animate-pulse bg-gray-600 rounded px-2 py-1">
                          Loading...
                        </span>
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
        </div>

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
