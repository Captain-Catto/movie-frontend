"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import MoviesGrid from "@/components/movie/MoviesGrid";
import MovieFilters, { FilterOptions } from "@/components/movie/MovieFilters";
import { MovieCardData } from "@/components/movie/MovieCard";
import { apiService } from "@/services/api";

export default function TVShowsPage() {
  const router = useRouter();
  const [tvShows, setTVShows] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (filters: FilterOptions) => {
    // Chuyển sang trang browse với filters
    const params = new URLSearchParams();
    if (filters.countries?.length)
      params.set("countries", filters.countries.join(","));
    if (filters.genres?.length) params.set("genres", filters.genres.join(","));
    if (filters.years?.length) params.set("years", filters.years.join(","));
    if (filters.movieType) params.set("movieType", filters.movieType);
    if (filters.ratings?.length)
      params.set("ratings", filters.ratings.join(","));
    if (filters.sortBy && filters.sortBy !== "latest")
      params.set("sortBy", filters.sortBy);
    params.set("type", "tv");

    router.push(`/browse?${params.toString()}`);
  };

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getTVSeries({
          page: 1,
          limit: 20,
          language: "en-US",
        });

        if (response.success && response.data) {
          // TV API returns nested structure: response.data.data contains the array
          const responseData = response.data as any;
          const tvSeriesArray = Array.isArray(responseData)
            ? responseData
            : responseData.data || [];

          // Convert API response to MovieCardData format directly (simple approach like original)
          const tvShowsWithCardData: MovieCardData[] = tvSeriesArray.map(
            (series: any) => {
              // Ensure we use tmdbId for routing
              const routeId =
                series.tmdbId && series.tmdbId !== series.id
                  ? series.tmdbId
                  : series.id;

              const tvShow = {
                id: series.id?.toString() || "0",
                tmdbId: series.tmdbId || series.id, // Ensure tmdbId is passed
                title: series.title || series.name || "Unknown",
                aliasTitle:
                  series.originalName ||
                  series.title ||
                  series.name ||
                  "Unknown",
                poster: series.posterUrl || "/images/no-poster.jpg",
                href: `/tv/${routeId}`, // Use calculated routeId
                year: series.firstAirDate
                  ? new Date(series.firstAirDate).getFullYear()
                  : undefined,
                rating: parseFloat(series.voteAverage) || undefined,
                genre: "TV Series",
                genres: [],
                description: series.overview,
                episodeNumber: series.numberOfEpisodes,
                totalEpisodes: series.numberOfEpisodes,
                isComplete: series.status === "Ended",
              };

              // Debug log to check the data being passed
              console.log("🔍 TV Series Card Data:", {
                title: tvShow.title,
                id: tvShow.id,
                tmdbId: tvShow.tmdbId,
                routeId: routeId,
                href: tvShow.href,
                originalSeriesId: series.id,
                originalSeriesTmdbId: series.tmdbId,
              });

              return tvShow;
            }
          );

          setTVShows(tvShowsWithCardData);
        } else {
          throw new Error(response.message || "Failed to fetch TV series");
        }
      } catch (err) {
        console.error("Error fetching TV series:", err);
        setError(err instanceof Error ? err.message : "An error occurred");

        // Fallback to empty array
        setTVShows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTVShows();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="pt-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-white mb-8">
              📺 Phim Bộ / TV Series
            </h1>

            {/* Filter skeleton */}
            <div className="mb-8">
              <div className="w-48 h-8 bg-gray-700/50 animate-pulse rounded mb-4"></div>
              <div className="w-96 h-10 bg-gray-700/50 animate-pulse rounded"></div>
            </div>

            {/* TV series grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, index) => (
                <div key={index} className="sw-item group relative">
                  <div className="v-thumbnail block">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                      <div className="absolute inset-0 bg-gray-700/50 animate-pulse" />
                      <div className="absolute top-2 right-2">
                        <div className="w-8 h-8 bg-gray-600/50 animate-pulse rounded-full" />
                      </div>
                      {/* Episode indicator skeleton */}
                      <div className="absolute bottom-2 left-2">
                        <div className="w-16 h-4 bg-red-600/50 animate-pulse rounded-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="info mt-3 space-y-2">
                    <div className="h-4 bg-gray-700/50 animate-pulse rounded" />
                    <div className="h-3 w-3/4 bg-gray-700/50 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8">
            📺 Phim Bộ / TV Series
          </h1>

          {/* Filter Component */}
          <MovieFilters onFilterChange={handleFilterChange} className="mb-8" />

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              Lỗi: {error}
            </div>
          )}
        </div>

        <MoviesGrid title="" movies={tvShows} className="py-8" />
      </div>
    </Layout>
  );
}
