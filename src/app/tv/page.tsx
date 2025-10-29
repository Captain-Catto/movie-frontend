"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import MoviesGrid from "@/components/movie/MoviesGrid";
import MovieFilters, { FilterOptions } from "@/components/movie/MovieFilters";
import { MovieCardData } from "@/components/movie/MovieCard";
import { apiService } from "@/services/api";

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

function TVShowsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tvShows, setTVShows] = useState<MovieCardData[]>([]);
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
    if (filters.ratings?.length)
      params.set("ratings", filters.ratings.join(","));
    if (filters.sortBy && filters.sortBy !== "latest")
      params.set("sortBy", filters.sortBy);
    params.set("type", "tv");

    router.push(`/browse?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);

    // Update URL with new page parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`/tv?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.getTVSeries({
          page: currentPage,
          limit: 24,
          language: "en-US",
        });

        if (response.success && response.data) {
          // TV API may return array directly or nested under data property.
          const rawData = response.data as unknown;
          let tvSeriesArray: Array<Record<string, unknown>> = [];
          let paginationData:
            | { totalPages?: number }
            | Record<string, unknown>
            | undefined;

          if (Array.isArray(rawData)) {
            tvSeriesArray = rawData as Array<Record<string, unknown>>;
            paginationData = response.pagination as Record<string, unknown> | undefined;
          } else if (rawData && typeof rawData === "object") {
            const dataWrapper = rawData as Record<string, unknown>;
            const nestedData = dataWrapper.data;
            if (Array.isArray(nestedData)) {
              tvSeriesArray = nestedData as Array<Record<string, unknown>>;
            }
            paginationData = (dataWrapper.pagination ??
              response.pagination) as Record<string, unknown> | undefined;
          }

          const ensureNumber = (value: unknown): number | undefined => {
            if (typeof value === "number" && Number.isFinite(value)) {
              return value;
            }
            if (typeof value === "string") {
              const parsed = Number(value);
              return Number.isNaN(parsed) ? undefined : parsed;
            }
            return undefined;
          };

          const ensureString = (value: unknown): string | undefined =>
            typeof value === "string" && value.length > 0 ? value : undefined;

          const ensureNumberArray = (value: unknown): number[] =>
            Array.isArray(value)
              ? value
                  .map((item) => {
                    if (typeof item === "number") return item;
                    if (typeof item === "string") {
                      const parsed = Number(item);
                      return Number.isNaN(parsed) ? null : parsed;
                    }
                    return null;
                  })
                  .filter((item): item is number => item !== null)
              : [];

          const extractYear = (value: unknown): number | undefined => {
            if (typeof value === "string" && value.length >= 4) {
              const parsedYear = new Date(value).getFullYear();
              return Number.isNaN(parsedYear) ? undefined : parsedYear;
            }
            return undefined;
          };

          // Convert API response to MovieCardData format directly
          const tvShowsWithCardData: MovieCardData[] = tvSeriesArray
            .map((series: Record<string, unknown>) => {
              const tmdbId =
                ensureNumber(series.tmdbId) ?? ensureNumber(series.id);

              if (!tmdbId) {
                console.warn("Skipping series due to missing tmdbId:", series);
                return null;
              }

              const posterPath = ensureString(series.posterPath);
              const posterUrl = ensureString(series.posterUrl);
              const poster =
                posterUrl ||
                (posterPath
                  ? `https://image.tmdb.org/t/p/w500${posterPath}`
                  : "/images/no-poster.svg");

              const backdropPath = ensureString(series.backdropPath);
              const backdropUrl = ensureString(series.backdropUrl);
              const backgroundImage =
                backdropUrl ||
                (backdropPath
                  ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
                  : poster);

              const voteAverage =
                ensureNumber(series.voteAverage) ??
                ensureNumber(series.vote_average);
              const rating =
                voteAverage !== undefined
                  ? Math.round(voteAverage * 10) / 10
                  : undefined;

              const releaseDate =
                ensureString(series.firstAirDate) ?? ensureString(series.first_air_date);
              const year = extractYear(releaseDate) ?? new Date().getFullYear();

              const tvGenres =
                ensureNumberArray(series.genreIds ?? series.genre_ids) || [];

              const genres =
                tvGenres
                  .map((id) => TMDB_TV_ENGLISH_GENRE_MAP[id])
                  .filter(Boolean) || [];

              const fallbackTitle = ensureString(series.title);
              const fallbackName = ensureString(series.name);
              const title =
                ensureString(series.originalName) ??
                ensureString(series.original_name) ??
                fallbackTitle ??
                fallbackName ??
                "Untitled";

              const aliasTitle =
                ensureString(series.aliasTitle) ??
                ensureString(series.original_name) ??
                title;

              const description = ensureString(series.overview) ?? "";

              const mediaType =
                ensureString(series.mediaType) ??
                ensureString(series.media_type) ??
                "tv";

              const href = mediaType === "tv" ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;

              const episodes =
                ensureNumber(series.numberOfEpisodes) ??
                ensureNumber(series.episodeNumber) ??
                ensureNumber(series.number_of_episodes);

              const tvShow: MovieCardData = {
                id: tmdbId.toString(),
                tmdbId,
                title,
                aliasTitle,
                poster,
                href,
                year,
                rating,
                description,
                genres,
                genre: genres[0] || "Uncategorized",
                backgroundImage,
                posterImage: poster,
                isComplete: ensureString(series.status) === "Ended",
                totalEpisodes: episodes,
              };

              return tvShow;
            })
            .filter((tvShow): tvShow is MovieCardData => tvShow !== null);

          setTVShows(tvShowsWithCardData);

          // Set pagination info from response
          if (paginationData) {
            console.log("🔍 TV Pagination data:", paginationData);
            const totalPagesValue =
              (paginationData as { totalPages?: number }).totalPages ??
              (paginationData as { total_pages?: number }).total_pages;
            if (
              typeof totalPagesValue === "number" &&
              Number.isFinite(totalPagesValue) &&
              totalPagesValue > 0
            ) {
              setTotalPages(totalPagesValue);
              console.log("📄 Set totalPages to:", totalPagesValue);
            } else {
              setTotalPages(1);
            }
          } else {
            console.log("❌ No pagination data in TV response");
            setTotalPages(1);
          }
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
  }, [currentPage]);

  if (loading) {
    return (
      <Layout>
        <div>
          <div className="container mx-auto px-4 pt-16">
            <h1 className="text-3xl font-bold text-white mb-8">
              📺 Phim Bộ / TV Series
            </h1>

            {/* Filter skeleton */}
            <div className="mb-8">
              <div className="w-48 h-8 bg-gray-700/50 animate-pulse rounded mb-4"></div>
              <div className="w-96 h-10 bg-gray-700/50 animate-pulse rounded"></div>
            </div>

            {/* TV series grid skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 16 }).map((_, index) => (
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
      <div className="container mx-auto px-4 pt-16">
        <h1 className="text-3xl font-bold text-white mb-8">
          📺 Phim Bộ / TV Series
        </h1>

        {/* Filter Component */}
        <div className="mb-8">
          <MovieFilters onFilterChange={handleFilterChange} />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
            Lỗi: {error}
          </div>
        )}
      </div>

      <MoviesGrid
        title=""
        movies={tvShows}
        className="py-8"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Layout>
  );
}

export default function TVShowsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-white">
          Đang tải danh sách phim bộ...
        </div>
      }
    >
      <TVShowsPageContent />
    </Suspense>
  );
}
