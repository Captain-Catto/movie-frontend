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
  FALLBACK_POSTER,
} from "@/constants/app.constants";

function MoviesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);

  const handleFilterChange = (filters: FilterOptions) => {
    // Chuyển sang trang browse với filters
    const params = new URLSearchParams();
    if (filters.countries?.length)
      params.set("countries", filters.countries.join(","));
    if (filters.genres?.length) params.set("genres", filters.genres.join(","));
    if (filters.years?.length) params.set("years", filters.years.join(","));
    if (filters.movieType) params.set("movieType", filters.movieType);
    if (filters.sortBy && filters.sortBy !== "latest")
      params.set("sortBy", filters.sortBy);
    params.set("type", "movie");

    router.push(`/browse?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);

    // Update URL with new page parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`/movies?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getMovies({
          page: currentPage,
          limit: DEFAULT_BROWSE_PAGE_SIZE,
          language: DEFAULT_LANGUAGE,
        });

        if (response.success && response.data) {
          const frontendMovies = mapMoviesToFrontend(response.data);
          // Use frontend movies directly since they already match MovieCardData interface
          setMovies(frontendMovies as MovieCardData[]);

          // Set pagination info from response
          if (response.pagination) {
            setTotalPages(response.pagination.totalPages);
          }
        } else {
          throw new Error(response.message || "Failed to fetch movies");
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError(err instanceof Error ? err.message : "An error occurred");

        // Fallback to static data on error
        const fallbackMovies: MovieCardData[] = [
          {
            id: "movie1",
            tmdbId: 0,
            title: "Loading...",
            aliasTitle: "Backend not available",
            poster: FALLBACK_POSTER,
            posterImage: FALLBACK_POSTER,
            href: "/movie/1",
            isComplete: false,
          },
        ];
        setMovies(fallbackMovies);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage]);

  if (loading) {
    return (
      <Layout>
        <Container withHeaderOffset className="py-8">
          <h1 className="text-3xl font-bold text-white mb-8">🎬 Movies</h1>

          {/* Filter skeleton */}
          <div className="mb-8">
            <div className="w-48 h-8 bg-gray-700/50 animate-pulse rounded mb-4"></div>
            <div className="w-96 h-10 bg-gray-700/50 animate-pulse rounded"></div>
          </div>

          {/* Movies grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: 16 }).map((_, index) => (
              <div key={index} className="sw-item group relative">
                <div className="v-thumbnail block">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                    <div className="absolute inset-0 bg-gray-700/50 animate-pulse" />
                    <div className="absolute top-2 right-2">
                      <div className="w-8 h-8 bg-gray-600/50 animate-pulse rounded-full" />
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
      <Container withHeaderOffset className="py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-8">🎬 Movies</h1>

          {/* Filter Component */}
          <div className="mb-8">
            <MovieFilters onFilterChange={handleFilterChange} />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              Error: {error}
            </div>
          )}
        </div>

        <MoviesGrid
          title=""
          movies={movies}
          className=""
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Container>
    </Layout>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={null}>
      <MoviesPageContent />
    </Suspense>
  );
}
