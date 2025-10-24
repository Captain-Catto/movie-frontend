"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import MovieFilters, { FilterOptions } from "@/components/movie/MovieFilters";
import MovieCard, { MovieCardData } from "@/components/movie/MovieCard";
import { apiService } from "@/services/api";
import { mapMoviesToFrontend } from "@/utils/movieMapper";

function BrowsePageContent() {
  const searchParams = useSearchParams();
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
  const [pageTitle, setPageTitle] = useState("🎬 Duyệt Phim");

  const fetchMovies = async (filters: FilterOptions, type?: string) => {
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
        page: 1,
        limit: 24,
        language: "en-US",
      };

      if (filters.countries?.length) {
        queryParams.countries = filters.countries.join(",");
      }
      if (filters.genres?.length) queryParams.genre = filters.genres.join(","); // ✅ Fix: use "genre" to match MovieQuery interface
      if (filters.years?.length) queryParams.year = parseInt(filters.years[0]);
      if (filters.sortBy) queryParams.sortBy = filters.sortBy;

      console.log("🔍 Frontend Debug - Current filters:", filters);
      console.log("🌐 Fetching with queryParams:", queryParams);
      console.log("📋 QueryParams details:", {
        countries: queryParams.countries,
        genre: queryParams.genre, // ✅ Fix: check "genre" to match what we actually set
        sortBy: queryParams.sortBy,
        year: queryParams.year,
      });

      let response;

      // Call appropriate endpoint based on type
      if (type === "tv") {
        response = await apiService.getTVSeries(queryParams);
      } else {
        // Default to movies
        response = await apiService.getMovies(queryParams);
      }

      if (response.success && response.data) {
        // Handle nested data structure - TV endpoint returns data.data, movies endpoint returns data directly
        const movieData = Array.isArray(response.data)
          ? response.data
          : (response.data as { data?: unknown[] }).data || [];
        const frontendMovies = mapMoviesToFrontend(movieData as never[]);
        // Use frontend movies directly since they already match MovieCardData interface
        setMovies(frontendMovies as MovieCardData[]);
      } else {
        throw new Error(response.message || "Failed to fetch content");
      }
    } catch (err) {
      console.error("Error fetching content:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    console.log("🎯 handleFilterChange called with:", filters);
    const type = searchParams.get("type");
    setCurrentFilters(filters);
    fetchMovies(filters, type || undefined);
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
    const type = searchParams.get("type"); // movie, tv, trending

    // Keep genre IDs as is - no conversion needed
    const genres = genreIds;

    // Cập nhật title dựa trên type
    switch (type) {
      case "movie":
        setPageTitle("🎬 Duyệt Phim Lẻ");
        break;
      case "tv":
        setPageTitle("📺 Duyệt Phim Bộ");
        break;
      case "trending":
        setPageTitle("🔥 Duyệt Phim Trending");
        break;
      default:
        setPageTitle("🎬 Duyệt Phim");
    }

    const filtersFromUrl: FilterOptions = {
      countries,
      movieType: type || movieType, // Set movieType based on URL type parameter
      genres,
      years,
      customYear: "",
      sortBy,
    };

    setCurrentFilters(filtersFromUrl);
    fetchMovies(filtersFromUrl, type || undefined);
  }, [searchParams]);

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-16">
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
            Lỗi: {error}
          </div>
        )}

        {loading ? (
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
                Không có phim nào
              </h3>
              <p>Không tìm thấy phim nào với bộ lọc hiện tại.</p>
              <p className="text-sm mt-2">
                Hãy thử thay đổi bộ lọc để xem kết quả khác.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-white">
          Đang tải nội dung...
        </div>
      }
    >
      <BrowsePageContent />
    </Suspense>
  );
}
