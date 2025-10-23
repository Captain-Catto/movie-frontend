"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import TrailerButton from "@/components/ui/TrailerButton";
import CastSkeleton from "@/components/ui/CastSkeleton";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import { apiService } from "@/services/api";

// TMDB TV Genre mapping to English names
const TMDB_TV_ENGLISH_GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

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
  const tvIdParam = params.id as string;
  const numericTvId = Number(tvIdParam);
  const [tvData, setTVData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

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
          const creatorPerson =
            credits.crew?.find((person: any) => person.job === "Creator") ||
            credits.created_by?.[0];
          const creator = creatorPerson
            ? {
                id: creatorPerson.id,
                name: creatorPerson.name,
              }
            : null;

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
            creator: null,
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
          creator: null,
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
        creator: null,
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

        if (!tvIdParam || Number.isNaN(numericTvId) || numericTvId <= 0) {
          throw new Error("Invalid TV series ID");
        }

        console.log("Fetching TV series details for ID:", numericTvId);
        const response = await apiService.getTVSeriesById(numericTvId);

        if (response.success && response.data) {
          const tv = response.data as any; // Cast to any to handle TV-specific fields
          console.log("TV series data received:", tv);

          // Process TV series data - handle both backend format and TMDB format
          const processedTVData = {
            id: tv.id,
            tmdbId: tv.tmdbId || tv.id,
            title: tv.title || tv.name,
            originalTitle:
              tv.originalTitle || tv.original_name || tv.title || tv.name,
            overview: tv.overview,
            firstAirDate:
              tv.releaseDate || tv.firstAirDate || tv.first_air_date,
            lastAirDate: tv.lastAirDate || tv.last_air_date,
            voteAverage: tv.voteAverage || tv.vote_average,
            voteCount: tv.voteCount || tv.vote_count,
            popularity: tv.popularity,
            // Fix: Use posterUrl/backdropUrl from API, fallback to posterPath/backdropPath
            posterPath: tv.posterUrl || tv.posterPath || tv.poster_path,
            backdropPath: tv.backdropUrl || tv.backdropPath || tv.backdrop_path,
            genres:
              (tv.genreIds || tv.genre_ids)
                ?.map((id: number) => TMDB_TV_ENGLISH_GENRE_MAP[id])
                .filter(Boolean) || [],
            genreIds: tv.genreIds || tv.genre_ids || [],
            numberOfEpisodes: tv.numberOfEpisodes || tv.number_of_episodes,
            numberOfSeasons: tv.numberOfSeasons || tv.number_of_seasons,
            episodeRunTime: tv.episodeRunTime || tv.episode_run_time,
            status: tv.status || "Unknown",
            type: tv.type,
            adult: tv.adult,
            inProduction: tv.inProduction || tv.in_production,
            originCountry: tv.originCountry || tv.origin_country,
            originalLanguage: tv.originalLanguage || tv.original_language,
            // Handle created_by from TMDB data directly
            createdBy: tv.created_by || [],
            // Handle production countries
            productionCountries: tv.production_countries || [],
            // Default values that will be updated by credits
            creator: null,
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
  }, [numericTvId, tvIdParam]);

  // Helper functions
  const getPosterUrl = (posterPath: string | null) => {
    console.log("Poster path:", posterPath);
    if (!posterPath) return "/images/no-poster.svg";
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
    if (!backdropPath) return "/images/no-poster.svg";
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
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[70vh] lg:pt-16 md:pt-36 pt-32">
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
              <div className="hidden md:block flex-shrink-0">
                <div className="relative w-64 h-96">
                  <Image
                    src={getPosterUrl(tvData.posterPath)}
                    alt={tvData.title}
                    fill
                    className="object-cover rounded-lg shadow-2xl"
                    loading="lazy"
                    sizes="256px"
                  />
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
                  {tvData.voteAverage && parseFloat(String(tvData.voteAverage)) > 0 && (
                    <div className="flex items-center bg-yellow-500 text-black px-3 py-1 rounded-full">
                      <span className="mr-1">⭐</span>
                      <span className="font-bold">
                        {typeof tvData.voteAverage === "number"
                          ? tvData.voteAverage.toFixed(1)
                          : parseFloat(tvData.voteAverage)?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  )}
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
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                  {tvData.genres.map((genre: string, index: number) => {
                    const genreId = tvData.genreIds?.[index];
                    return (
                      <Link
                        key={index}
                        href={`/browse?type=tv&genres=${
                          genreId || encodeURIComponent(genre)
                        }`}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      >
                        {genre}
                      </Link>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/watch/tv-${tvData.tmdbId || tvId}`}
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
                    Xem Series
                  </Link>

                  <FavoriteButton
                    item={{
                      id: tvData.id?.toString() || tvId,
                      title: tvData.title || "Unknown Title",
                      type: "tv-show",
                      year: tvData.firstAirDate
                        ? new Date(tvData.firstAirDate).getFullYear()
                        : 2025,
                      rating: tvData.voteAverage,
                      image: tvData.posterPath,
                    }}
                    size="lg"
                    className="px-8 py-4 !rounded-lg font-semibold"
                  />

                  <TrailerButton
                    movieId={tvData.tmdbId || parseInt(tvId)}
                    movieTitle={tvData.title}
                    contentType="tv"
                    className="px-8 py-4 !rounded-lg font-semibold"
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
              <h3 className="text-2xl font-bold text-white mb-6">
                Nội dung phim
              </h3>
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
                          className="ml-2 text-red-400 hover:text-red-300 font-medium transition-colors"
                        >
                          Xem thêm
                        </button>
                      </>
                    )
                  ) : (
                    "Không có mô tả."
                  )}
                </p>
                {showFullDescription &&
                  tvData.overview &&
                  tvData.overview.length > 300 && (
                    <button
                      onClick={() => setShowFullDescription(false)}
                      className="mt-2 text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Thu gọn
                    </button>
                  )}
              </div>

              {/* Cast Section */}
              {(tvData.cast && tvData.cast.length > 0) || creditsLoading ? (
                <>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Diễn viên
                  </h3>
                  {creditsLoading ? (
                    <CastSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                      {tvData.cast.slice(0, 10).map((actor: CastMember) => (
                        <Link
                          key={actor.id}
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
                  Thông tin phim
                </h3>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <span className="text-gray-500">Sáng tạo bởi:</span>
                    <div className="mt-1">
                      {tvData.createdBy && tvData.createdBy.length > 0 ? (
                        tvData.createdBy.map((creator: any, index: number) => (
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
                          Đang tải...
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
                    <div className="mt-1">
                      {tvData.productionCountries &&
                      tvData.productionCountries.length > 0 ? (
                        tvData.productionCountries.map(
                          (country: any, index: number) => (
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
                          Đang tải...
                        </span>
                      ) : (
                        tvData.country || "Unknown"
                      )}
                    </div>
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
                  {tvData.episodeRunTime &&
                    tvData.episodeRunTime.length > 0 && (
                      <div>
                        <span className="text-gray-500">Thời lượng/tập:</span>
                        <span className="ml-2">
                          {formatRuntime(tvData.episodeRunTime)}
                        </span>
                      </div>
                    )}
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
      </div>
    </Layout>
  );
};

export default function TVDetailPage() {
  return <TVDetailPageContent />;
}
