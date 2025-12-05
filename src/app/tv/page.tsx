"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MoviesGrid from "@/components/movie/MoviesGrid";
import MovieFilters, { FilterOptions } from "@/components/movie/MovieFilters";
import { MovieCardData } from "@/components/movie/MovieCard";
import { apiService } from "@/services/api";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_TV_PAGE_SIZE,
  SKELETON_COUNT_TV,
} from "@/constants/app.constants";
import useMovieCategory from "@/hooks/useMovieCategory";
import { mapTVSeriesToFrontendList } from "@/utils/tvMapper";
import { TVSeries } from "@/types/movie";
import PageSkeleton from "@/components/ui/PageSkeleton";

function TVShowsPageContent() {
  const router = useRouter();
  const {
    movies: tvShows,
    loading,
    error,
    totalPages,
    currentPage,
    handlePageChange,
  } = useMovieCategory({
    basePath: "/tv",
    fetcher: apiService.getTVSeries.bind(apiService),
    mapper: (items) =>
      mapTVSeriesToFrontendList(items as unknown as TVSeries[]) as MovieCardData[],
    defaultLimit: DEFAULT_TV_PAGE_SIZE,
    defaultLanguage: DEFAULT_LANGUAGE,
  });

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

  if (loading) {
    return (
      <Layout>
        <Container withHeaderOffset className="py-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            📺 TV Series
          </h1>

          {/* Filter skeleton */}
          <div className="mb-8">
            <div className="w-48 h-8 bg-gray-700/50 animate-pulse rounded mb-4"></div>
            <div className="w-96 h-10 bg-gray-700/50 animate-pulse rounded"></div>
          </div>

          {/* TV series grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: SKELETON_COUNT_TV }).map((_, index) => (
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
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container withHeaderOffset className="py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-8">
            📺 TV Series
          </h1>

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
          movies={tvShows}
          className=""
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Container>
    </Layout>
  );
}

export default function TVShowsPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton title="TV Series" items={SKELETON_COUNT_TV} showFilters />
      }
    >
      <TVShowsPageContent />
    </Suspense>
  );
}
