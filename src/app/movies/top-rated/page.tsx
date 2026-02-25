import CategoryListingPage from "@/components/content/CategoryListingPage";
import { DEFAULT_MOVIE_PAGE_SIZE } from "@/constants/app.constants";
import {
  extractCategoryItems,
  extractCategoryPagination,
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { apiService } from "@/services/api";
import type { Movie, MovieCardData } from "@/types/content.types";
import { mapMoviesToFrontend } from "@/utils/movieMapper";

interface TopRatedPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export default async function TopRatedPage({
  searchParams,
}: TopRatedPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  let movies: MovieCardData[] = [];
  let totalPages = 1;
  let total = 0;
  let error: string | null = null;

  try {
    const response = await apiService.getTopRatedMovies({
      page: currentPage,
      limit: DEFAULT_MOVIE_PAGE_SIZE,
      language,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch top rated movies");
    }

    const items = extractCategoryItems(response.data);
    movies = mapMoviesToFrontend(items as Movie[]);

    const pagination = extractCategoryPagination(response, movies.length);
    totalPages = pagination.totalPages;
    total = pagination.total;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <CategoryListingPage
      title={isVietnamese ? "Phim đánh giá cao" : "Top Rated Movies"}
      description={
        total > 0
          ? isVietnamese
            ? `${total} phim đánh giá cao`
            : `${total} top rated movies`
          : ""
      }
      total={total}
      items={movies}
      totalPages={totalPages}
      currentPage={currentPage}
      basePath="/movies/top-rated"
      emptyMessage={
        isVietnamese
          ? "Không tìm thấy phim đánh giá cao"
          : "No top rated movies found"
      }
      totalItemsLabel={isVietnamese ? "mục" : "items"}
      error={error}
    />
  );
}
