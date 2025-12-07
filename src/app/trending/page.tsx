"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MoviesGrid from "@/components/movie/MoviesGrid";
import MovieFilters, { FilterOptions } from "@/components/movie/MovieFilters";
import { MovieCardData } from "@/components/movie/MovieCard";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_BROWSE_PAGE_SIZE,
  SKELETON_COUNT_BROWSE,
} from "@/constants/app.constants";
import PageSkeleton from "@/components/ui/PageSkeleton";

function TrendingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trending, setTrending] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);

    // Update URL with new page parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`/trending?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getTrending({
          page: currentPage,
          limit: DEFAULT_BROWSE_PAGE_SIZE,
          language: DEFAULT_LANGUAGE,
        });

        if (response.success && response.data) {
          // Use mapMoviesToFrontend for consistent data mapping
          const frontendMovies = mapMoviesToFrontend(response.data);
          setTrending(frontendMovies);

          // Set pagination info from response
          const responseWithPagination = response as typeof response & {
            pagination?: { totalPages: number };
            data?: { pagination?: { totalPages: number } };
          };
          if (responseWithPagination.pagination) {
            setTotalPages(responseWithPagination.pagination.totalPages);
          } else if (responseWithPagination.data?.pagination) {
            // Handle nested pagination structure
            setTotalPages(responseWithPagination.data.pagination.totalPages);
          }
        } else {
          throw new Error(response.message || "Failed to fetch trending data");
        }
      } catch (err) {
        console.error("Error fetching trending:", err);
        setError(err instanceof Error ? err.message : "An error occurred");

        // Use minimal fallback data when API fails
        setTrending([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [currentPage]); // ✅ Add currentPage dependency

  const handleFilterChange = (filters: FilterOptions) => {
    // Chuyển sang trang browse với filters, ưu tiên movieType người dùng chọn
    const params = new URLSearchParams();
    if (filters.countries?.length)
      params.set("countries", filters.countries.join(","));
    if (filters.genres?.length) params.set("genres", filters.genres.join(","));
    if (filters.years?.length) params.set("years", filters.years.join(","));
    const targetType = filters.movieType || "trending";
    if (filters.ratings?.length)
      params.set("ratings", filters.ratings.join(","));
    if (filters.versions?.length)
      params.set("versions", filters.versions.join(","));
    if (filters.sortBy && filters.sortBy !== "latest")
      params.set("sortBy", filters.sortBy);
    params.set("type", targetType);

    router.push(`/browse?${params.toString()}`);
  };

  if (loading) {
    return (
      <Layout>
        <Container withHeaderOffset>
          <h1 className="text-3xl font-bold text-white mb-8">🔥 Trending</h1>

          {/* Filter skeleton */}
          <div className="mb-8">
            <div className="w-48 h-8 bg-gray-700/50 animate-pulse rounded mb-4"></div>
            <div className="w-96 h-10 bg-gray-700/50 animate-pulse rounded"></div>
          </div>

          {/* Trending grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: SKELETON_COUNT_BROWSE }).map((_, index) => (
              <div key={index} className="sw-item group relative">
                <div className="v-thumbnail block">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                    <div className="absolute inset-0 bg-gray-700/50 animate-pulse" />
                    <div className="absolute top-2 right-2">
                      <div className="w-8 h-8 bg-gray-600/50 animate-pulse rounded-full" />
                    </div>
                    {/* Trending badge skeleton */}
                    <div className="absolute top-2 left-2">
                      <div className="w-12 h-6 bg-yellow-500/50 animate-pulse rounded-full" />
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
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container withHeaderOffset>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-8">🔥 Trending</h1>

          {/* Filter Component */}
          <MovieFilters onFilterChange={handleFilterChange} className="mb-8" />

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              Error: {error}
            </div>
          )}
        </div>

        <MoviesGrid
          title=""
          movies={trending}
          className=""
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Container>
    </Layout>
  );
}

export default function TrendingPage() {
  return (
    <Suspense
      fallback={<PageSkeleton title="Trending" items={SKELETON_COUNT_BROWSE} />}
    >
      <TrendingPageContent />
    </Suspense>
  );
}
