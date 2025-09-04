"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import FavoriteButton from "@/components/ui/FavoriteButton";
import CastSkeleton from "@/components/ui/CastSkeleton";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import { apiService } from "@/services/api";
import { TMDB_TV_GENRE_MAP } from "@/utils/genresFetch";

const RecommendationsSection = lazy(
  () => import("@/components/movie/RecommendationsSection")
);

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

const TVDetailPageContent = () => {
  const params = useParams();
  const tvId = params.id as string;
  const [tvData, setTVData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch credits after basic TV data is loaded
  const fetchCredits = async (tvId: number) => {
    try {
      setCreditsLoading(true);
      console.log(`Fetching credits for TV series ID: ${tvId}`);

      // Try to get TV credits, fallback if endpoint doesn't exist
      try {
        const creditsResponse = await apiService.getTVCredits(tvId);
        if (creditsResponse.success && creditsResponse.data) {
          const credits = creditsResponse.data;

          // Find creator from crew
          const creator =
            credits.crew?.find((person: any) => person.job === "Creator")
              ?.name ||
            credits.created_by?.[0]?.name ||
            "Unknown";

          // Get country from origin_country
          const country = credits.origin_country?.[0] || "Unknown";

          // Update tvData with credits info
          setTVData((prevData: any) => ({
            ...prevData,
            creator,
            country,
            cast: credits.cast || [],
            crew: credits.crew || [],
          }));
        } else {
          console.warn("Failed to fetch TV credits:", creditsResponse.message);
          // Set default values if API fails
          setTVData((prevData: any) => ({
            ...prevData,
            creator: "Not available",
            country: "Not available",
            cast: [],
            crew: [],
          }));
        }
      } catch (creditsError) {
        console.warn(
          "TV Credits endpoint not available, using defaults:",
          creditsError
        );
        // Set default values if endpoint doesn't exist
        setTVData((prevData: any) => ({
          ...prevData,
          creator: "Not available",
          country: "Not available",
          cast: [],
          crew: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching TV credits:", error);
      // Set default values on any error
      setTVData((prevData: any) => ({
        ...prevData,
        creator: "Error loading",
        country: "Error loading",
        cast: [],
        crew: [],
      }));
    } finally {
      setCreditsLoading(false);
    }
  };

  useEffect(() => {
    const fetchTVData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!tvId || tvId === "undefined") {
          throw new Error("Invalid TV series ID");
        }

        console.log("Fetching TV series details for ID:", tvId);
        const response = await apiService.getTVSeriesById(parseInt(tvId));

        if (response.success && response.data) {
          const tv = response.data as any; // Cast to any to handle TV-specific fields
          console.log("TV series data received:", tv);

          // Process TV series data - handle both backend format and TMDB format
          const processedTVData = {
            id: tv.id,
            tmdbId: tv.tmdbId || tv.id,
            title: tv.title,
            originalTitle: tv.originalTitle || tv.title,
            overview: tv.overview,
            firstAirDate: tv.releaseDate || tv.firstAirDate,
            lastAirDate: tv.lastAirDate,
            voteAverage: tv.voteAverage,
            voteCount: tv.voteCount,
            popularity: tv.popularity,
            // Fix: Use posterUrl/backdropUrl from API, fallback to posterPath/backdropPath
            posterPath: tv.posterUrl || tv.posterPath,
            backdropPath: tv.backdropUrl || tv.backdropPath,
            genres:
              tv.genreIds
                ?.map((id: number) => TMDB_TV_GENRE_MAP[id])
                .filter(Boolean) || [],
            numberOfEpisodes: tv.numberOfEpisodes,
            numberOfSeasons: tv.numberOfSeasons,
            episodeRunTime: tv.episodeRunTime,
            status: tv.status || "Unknown",
            type: tv.type,
            adult: tv.adult,
            inProduction: tv.inProduction,
            originCountry: tv.originCountry,
            originalLanguage: tv.originalLanguage,
            // Default values that will be updated by credits
            creator: "Loading...",
            country: "Loading...",
            cast: [],
            crew: [],
          };

          console.log("Processed TV data:", processedTVData);
          setTVData(processedTVData);

          // Fetch additional credits data
          await fetchCredits(tv.tmdbId || tv.id);
        } else {
          throw new Error(response.message || "TV series not found");
        }
      } catch (error) {
        console.error("Error fetching TV series:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTVData();
  }, [tvId]);

  // Helper functions
  const getPosterUrl = (posterPath: string | null) => {
    console.log("Poster path:", posterPath);
    if (!posterPath) return "/images/no-poster.jpg";
    // If it's already a full URL, return it as is
    if (posterPath.startsWith("http")) {
      console.log("Generated poster URL (full):", posterPath);
      return posterPath;
    }
    // Otherwise construct TMDB URL
    const url = `https://image.tmdb.org/t/p/w500${posterPath}`;
    console.log("Generated poster URL (constructed):", url);
    return url;
  };

  const getBackdropUrl = (backdropPath: string | null) => {
    console.log("Backdrop path:", backdropPath);
    if (!backdropPath) return "/images/no-poster.jpg";
    // If it's already a full URL, return it as is
    if (backdropPath.startsWith("http")) {
      console.log("Generated backdrop URL (full):", backdropPath);
      return backdropPath;
    }
    // Otherwise construct TMDB URL
    const url = `https://image.tmdb.org/t/p/w1280${backdropPath}`;
    console.log("Generated backdrop URL (constructed):", url);
    return url;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const formatRuntime = (runtimes: number[]) => {
    if (!runtimes || runtimes.length === 0) return "N/A";
    const avgRuntime = Math.round(
      runtimes.reduce((a, b) => a + b, 0) / runtimes.length
    );
    return `${avgRuntime} phút/tập`;
  };

  if (loading) {
    return (
      <Layout>
        <DetailPageSkeleton />
      </Layout>
    );
  }

  if (error || !tvData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Không tìm thấy TV series
            </h1>
            <p className="text-gray-400">
              {error || "TV series này không tồn tại"}
            </p>
            <Link
              href="/tv"
              className="mt-4 inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ← Quay lại danh sách TV series
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 pt-16">
        {/* Hero Section */}
        <div className="relative h-[70vh] flex items-center">
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

          <div className="relative max-w-6xl mx-auto px-4 z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Poster */}
              <div className="flex-shrink-0 relative">
                <div className="w-80 h-[450px] relative rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={getPosterUrl(tvData.posterPath)}
                    alt={tvData.title}
                    fill
                    className="object-cover"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDHPKw8HFBcZLEEEEEEEgUCFQKBQQVBA"
                  />
                  {/* Favorite Button */}
                  <div className="absolute top-4 right-4">
                    <FavoriteButton
                      item={{ id: tvData.id.toString(), title: tvData.title }}
                      size="lg"
                      className="bg-black/50 hover:bg-black/70"
                    />
                  </div>
                </div>
              </div>

              {/* TV Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  {tvData.title}
                </h1>
                {tvData.originalTitle !== tvData.title && (
                  <p className="text-xl text-gray-300 mb-4">
                    {tvData.originalTitle}
                  </p>
                )}

                {/* Rating and Info */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="flex items-center bg-yellow-500 text-black px-3 py-1 rounded-full">
                    <span className="mr-1">⭐</span>
                    <span className="font-bold">
                      {typeof tvData.voteAverage === "number"
                        ? tvData.voteAverage.toFixed(1)
                        : parseFloat(tvData.voteAverage)?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full font-semibold">
                    TV Series
                  </span>
                  <span className="text-gray-300">
                    {formatDate(tvData.firstAirDate)}
                  </span>
                  <span className="text-gray-300">
                    {formatRuntime(tvData.episodeRunTime)}
                  </span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                  {tvData.genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Overview */}
                <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-3xl">
                  {tvData.overview || "Không có mô tả."}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                    <span>▶️</span>
                    Xem phim
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                    <span>🎬</span>
                    Trailer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Cast Section */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Diễn viên
                </h2>
                {creditsLoading ? (
                  <CastSkeleton />
                ) : tvData.cast && tvData.cast.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {tvData.cast.slice(0, 10).map((actor: CastMember) => (
                      <Link
                        key={actor.id}
                        href={`/people/${actor.id}`}
                        className="group block"
                      >
                        <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
                          <div className="aspect-[3/4] relative">
                            <Image
                              src={
                                actor.profile_path
                                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                  : "/images/no-poster.jpg"
                              }
                              alt={actor.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-white text-sm group-hover:text-red-400 transition-colors line-clamp-2">
                              {actor.name}
                            </h3>
                            <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                              {actor.character}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Không có thông tin diễn viên.</p>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-white mb-4">
                  Thông tin phim
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <span className="text-gray-500">Sáng tạo bởi:</span>
                    <span className="ml-2">
                      {creditsLoading ? (
                        <span className="animate-pulse bg-gray-600 rounded px-2 py-1">
                          Đang tải...
                        </span>
                      ) : (
                        tvData.creator
                      )}
                    </span>
                  </div>
                  {(tvData.cast && tvData.cast.length > 0) || creditsLoading ? (
                    <div>
                      <span className="text-gray-500">Diễn viên:</span>
                      <div className="mt-1">
                        {creditsLoading ? (
                          <span className="animate-pulse bg-gray-600 rounded px-2 py-1">
                            Đang tải...
                          </span>
                        ) : (
                          tvData.cast
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
                    <span className="text-gray-500">Quốc gia:</span>
                    <span className="ml-2">
                      {creditsLoading ? (
                        <span className="animate-pulse bg-gray-600 rounded px-2 py-1">
                          Đang tải...
                        </span>
                      ) : (
                        tvData.country
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ngày phát sóng đầu:</span>
                    <span className="ml-2">
                      {formatDate(tvData.firstAirDate)}
                    </span>
                  </div>
                  {tvData.lastAirDate && (
                    <div>
                      <span className="text-gray-500">
                        Ngày phát sóng cuối:
                      </span>
                      <span className="ml-2">
                        {formatDate(tvData.lastAirDate)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Thời lượng/tập:</span>
                    <span className="ml-2">
                      {formatRuntime(tvData.episodeRunTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Số mùa:</span>
                    <span className="ml-2">
                      {tvData.numberOfSeasons || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Số tập:</span>
                    <span className="ml-2">
                      {tvData.numberOfEpisodes || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ngôn ngữ:</span>
                    <span className="ml-2">
                      {tvData.originalLanguage?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className="ml-2 text-green-500">
                      {tvData.status === "Returning Series"
                        ? "Đang phát sóng"
                        : tvData.status === "Ended"
                        ? "Đã kết thúc"
                        : tvData.status === "Canceled"
                        ? "Đã hủy"
                        : tvData.status === "In Production"
                        ? "Đang sản xuất"
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
                    Gợi ý cho bạn
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

        {/* TODO: Create TVRecommendationsSection for TV series */}
        {/* 
        <Suspense
          fallback={<div className="h-96 bg-gray-800/50 animate-pulse" />}
        >
          <RecommendationsSection movieId={tvData.tmdbId} />
        </Suspense>
        */}
      </div>
    </Layout>
  );
};

export default function TVDetailPage() {
  return <TVDetailPageContent />;
}
