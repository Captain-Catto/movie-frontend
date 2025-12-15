"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieFilters, { FilterOptions } from "@/components/movie/MovieFilters";
import MovieCard from "@/components/movie/MovieCard";
import type { MovieCardData } from "@/types/movie";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { Pagination } from "@/components/ui/Pagination";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_BROWSE_PAGE_SIZE,
  SKELETON_COUNT_BROWSE,
} from "@/constants/app.constants";

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    countries: [],
    movieType: "",
    genres: [],
    years: [],
    customYear: "",
    sortBy: "popularity",
  });
  const [pageTitle, setPageTitle] = useState("🎬 Browse Movies");
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: DEFAULT_BROWSE_PAGE_SIZE,
  });

  const updateUrlWithFilters = useCallback(
    (filters: FilterOptions, page: number, type?: string | null) => {
      const params = new URLSearchParams();

      if (filters.countries?.length) {
        params.set("countries", filters.countries.join(","));
      }
      if (filters.genres?.length) {
        params.set("genres", filters.genres.join(","));
      }
      if (filters.years?.length) {
        params.set("years", filters.years.join(","));
      }
      if (filters.customYear) {
        params.set("customYear", filters.customYear);
      }
      if (filters.sortBy && filters.sortBy !== "popularity") {
        params.set("sortBy", filters.sortBy);
      }
      if (type) {
        params.set("type", type);
      }
      if (page > 1) {
        params.set("page", page.toString());
      }

      const queryString = params.toString();
      router.replace(`/browse${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [router]
  );

  const fetchMovies = useCallback(
    async (filters: FilterOptions, page: number, type?: string) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams: {
          page: number;
          limit: number;
          language: string;
          countries?: string;
          genre?: string;
          year?: number;
          sortBy?: string;
        } = {
          page,
          limit: paginationInfo.limit || DEFAULT_BROWSE_PAGE_SIZE,
          language: DEFAULT_LANGUAGE,
        };

        if (filters.countries?.length) {
          queryParams.countries = filters.countries.join(",");
        }
        if (filters.genres?.length) {
          // Backend expects numeric genre ids; pass through trimmed ids
          const normalizedGenres = filters.genres
            .map((g) => g.trim())
            .filter(Boolean);
          if (normalizedGenres.length) {
            queryParams.genre = normalizedGenres.join(",");
          }
        }
        const targetYear =
          filters.customYear ||
          (filters.years?.length ? filters.years[0] : undefined);
        if (targetYear) {
          const parsedYear = parseInt(targetYear, 10);
          if (!Number.isNaN(parsedYear)) {
            queryParams.year = parsedYear;
          }
        }
        if (filters.sortBy) queryParams.sortBy = filters.sortBy;

        let response;

        // Call appropriate endpoint based on type
        if (type === "tv") {
          response = await apiService.getTVSeries(queryParams);
        } else if (type === "trending") {
          const trendingQuery = {
            page,
            limit: paginationInfo.limit || DEFAULT_BROWSE_PAGE_SIZE,
            language: queryParams.language,
          };
          response = await apiService.getTrending(trendingQuery);
        } else {
          // Default to movies
          response = await apiService.getMovies(queryParams);
        }

        if (response.success && response.data) {
          // Handle nested data structure - TV endpoint returns data.data, movies endpoint returns data directly
          const movieData = Array.isArray(response.data)
            ? response.data
            : (response.data as { data?: unknown[] }).data || [];
          let frontendMovies = mapMoviesToFrontend(movieData as never[]);

          // Client-side genre filter for trending (backend doesn't support genre filter)
          if (type === "trending" && filters.genres?.length) {
            const genreFilterIds = filters.genres
              .map((g) => Number(g))
              .filter((n) => Number.isFinite(n));
            if (genreFilterIds.length) {
              frontendMovies = frontendMovies.filter((movie) => {
                if (!movie.genreIds || movie.genreIds.length === 0)
                  return false;
                return movie.genreIds.some((id) => genreFilterIds.includes(id));
              });
            }
          }
          // Use frontend movies directly since they already match MovieCardData interface
          setMovies(frontendMovies as MovieCardData[]);

          let responseRecord: Record<string, unknown> = {};
          if (typeof response === "object" && response !== null) {
            responseRecord = response as unknown as Record<string, unknown>;
          }
          const topLevelPagination =
            (responseRecord.pagination as
              | Record<string, unknown>
              | undefined) ?? undefined;

          const metaRecord =
            responseRecord.meta && typeof responseRecord.meta === "object"
              ? (responseRecord.meta as Record<string, unknown>)
              : undefined;
          const metaPagination =
            metaRecord && typeof metaRecord.pagination === "object"
              ? (metaRecord.pagination as Record<string, unknown>)
              : undefined;

          const dataRecord =
            responseRecord.data && typeof responseRecord.data === "object"
              ? (responseRecord.data as Record<string, unknown>)
              : undefined;
          const dataPagination =
            dataRecord && typeof dataRecord.pagination === "object"
              ? (dataRecord.pagination as Record<string, unknown>)
              : undefined;

          const rawPagination =
            topLevelPagination ?? metaPagination ?? dataPagination ?? {};

          const pageFromResponse = Number(
            rawPagination.page ??
              rawPagination.currentPage ??
              rawPagination.current_page ??
              (metaRecord?.page as number | undefined) ??
              page ??
              1
          );

          const totalItems = Number(
            rawPagination.total ??
              rawPagination.totalItems ??
              rawPagination.total_items ??
              rawPagination.totalResults ??
              0
          );

          let totalPages = Number(
            rawPagination.totalPages ??
              rawPagination.total_pages ??
              rawPagination.totalPage ??
              rawPagination.totalPageCount ??
              0
          );

          const limit = paginationInfo.limit || 24;
          if ((!totalPages || Number.isNaN(totalPages)) && totalItems) {
            totalPages = Math.ceil(totalItems / limit);
          }

          if (!totalPages || Number.isNaN(totalPages)) {
            totalPages = Math.max(
              1,
              Math.ceil((movieData as unknown[]).length / (limit || 1)) || 1
            );
          }

          setPaginationInfo({
            currentPage: pageFromResponse || page || 1,
            totalPages: Math.max(1, totalPages),
            totalItems,
            limit,
          });
        } else {
          throw new Error(response.message || "Failed to fetch content");
        }
      } catch (err) {
        console.error("Error fetching content:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setMovies([]);
        setPaginationInfo((prev) => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        }));
      } finally {
        setLoading(false);
      }
    },
    [paginationInfo.limit]
  );

  const handleFilterChange = (filters: FilterOptions) => {
    const typeFromFilters = filters.movieType || searchParams.get("type") || "";
    setCurrentFilters(filters);
    setPaginationInfo((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    updateUrlWithFilters(filters, 1, typeFromFilters || null);
  };

  // Xử lý URL parameters từ các trang khác
  useEffect(() => {
    const countries =
      searchParams.get("countries")?.split(",").filter(Boolean) || [];
    const genreIds =
      searchParams.get("genres")?.split(",").filter(Boolean) || [];
    const years = searchParams.get("years")?.split(",").filter(Boolean) || [];
    const movieType = searchParams.get("movieType") || "";
    const sortBy = searchParams.get("sortBy") || "popularity";
    const customYear = searchParams.get("customYear") || "";
    const type = searchParams.get("type"); // movie, tv, trending
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    // Keep genre IDs as is - no conversion needed
    const genres = genreIds;

    // Update title based on type
    switch (type) {
      case "movie":
        setPageTitle("🎬 Browse Movies");
        break;
      case "tv":
        setPageTitle("📺 Browse TV Series");
        break;
      case "trending":
        setPageTitle("🔥 Browse Trending");
        break;
      default:
        setPageTitle("🎬 Browse Movies");
    }

    const filtersFromUrl: FilterOptions = {
      countries,
      movieType: type || movieType, // Set movieType based on URL type parameter
      genres,
      years,
      customYear,
      sortBy,
    };

    setCurrentFilters(filtersFromUrl);
    setPaginationInfo((prev) => ({
      ...prev,
      currentPage: page,
    }));
    fetchMovies(filtersFromUrl, page, type || undefined);
  }, [fetchMovies, searchParams]);

  const handlePageChange = (page: number) => {
    const type = currentFilters.movieType || searchParams.get("type") || "";
    setPaginationInfo((prev) => ({
      ...prev,
      currentPage: page,
    }));
    updateUrlWithFilters(currentFilters, page, type || null);
  };

  return (
    <Layout>
      <Container withHeaderOffset>
        <h1 className="text-3xl font-bold text-white mb-8">{pageTitle}</h1>

        {/* Filter Component */}
        <div className="mb-8">
          <MovieFilters
            onFilterChange={handleFilterChange}
            initialFilters={currentFilters}
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-6">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: SKELETON_COUNT_BROWSE }).map((_, index) => (
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
                  <div className="h-3 w-2/3 bg-gray-700/50 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0012 15c-2.34 0-4.291-1.1-5.7-2.7"
                />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">
                No movies found
              </h3>
              <p>No movies found with the current filters.</p>
              <p className="text-sm mt-2">
                Try changing the filters to see different results.
              </p>
            </div>
          </div>
        )}

        {!loading && paginationInfo.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={paginationInfo.currentPage}
              totalPages={paginationInfo.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Container>
    </Layout>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-white">
          Loading content...
        </div>
      }
    >
      <BrowsePageContent />
    </Suspense>
  );
}
