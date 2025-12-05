"use client";
import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieGrid from "@/components/movie/MovieGrid";
import LinkPagination from "@/components/ui/LinkPagination";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { MovieCardData } from "@/components/movie/MovieCard";
import { Movie } from "@/types/movie";
import useMovieCategory from "@/hooks/useMovieCategory";
import { DEFAULT_LANGUAGE, DEFAULT_MOVIE_PAGE_SIZE, SKELETON_COUNT_MOVIE } from "@/constants/app.constants";
import PageSkeleton from "@/components/ui/PageSkeleton";

function PopularPageContent() {
  const { movies, loading, totalPages, total, currentPage } = useMovieCategory({
    basePath: "/movies/popular",
    fetcher: apiService.getPopularMovies.bind(apiService),
    mapper: (items) =>
      mapMoviesToFrontend(items as unknown as Movie[]) as MovieCardData[],
    defaultLimit: DEFAULT_MOVIE_PAGE_SIZE,
    defaultLanguage: DEFAULT_LANGUAGE,
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <Container withHeaderOffset className="py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Popular Movies
            </h1>
            <p className="text-gray-400">
              {total > 0 && `${total} popular movies`}
            </p>
          </div>

          {/* Movies Grid */}
          {(loading || movies.length > 0) && (
            <>
              <MovieGrid
                movies={movies}
                showFilters={false}
                containerPadding={false}
                loading={loading}
                skeletonCount={SKELETON_COUNT_MOVIE}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <LinkPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath="/movies/popular"
                  />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && movies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No popular movies found</p>
            </div>
          )}
        </Container>
      </div>
    </Layout>
  );
}

export default function PopularPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton title="Popular Movies" items={SKELETON_COUNT_MOVIE} />
      }
    >
      <PopularPageContent />
    </Suspense>
  );
}
