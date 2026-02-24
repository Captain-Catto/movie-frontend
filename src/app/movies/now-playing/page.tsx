"use client";
import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieGrid from "@/components/movie/MovieGrid";
import LinkPagination from "@/components/ui/LinkPagination";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import type { MovieCardData } from "@/types/content.types";
import { Movie } from "@/types/content.types";
import useMovieCategory from "@/hooks/useMovieCategory";
import {
  DEFAULT_MOVIE_PAGE_SIZE,
  SKELETON_COUNT_MOVIE,
} from "@/constants/app.constants";
import PageSkeleton from "@/components/ui/PageSkeleton";

function NowPlayingPageContent() {
  const { movies, loading, totalPages, total, currentPage } = useMovieCategory({
    basePath: "/movies/now-playing",
    fetcher: apiService.getNowPlayingMovies.bind(apiService),
    mapper: (items) =>
      mapMoviesToFrontend(items as unknown as Movie[]) as MovieCardData[],
    defaultLimit: DEFAULT_MOVIE_PAGE_SIZE,
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <Container withHeaderOffset>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Now Playing Movies
            </h1>
            <p className="text-gray-400">
              {total > 0 && `${total} movies now playing in theaters`}
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
                    basePath="/movies/now-playing"
                  />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && movies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies found</p>
            </div>
          )}
        </Container>
      </div>
    </Layout>
  );
}

export default function NowPlayingPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton title="Now Playing Movies" items={SKELETON_COUNT_MOVIE} />
      }
    >
      <NowPlayingPageContent />
    </Suspense>
  );
}
