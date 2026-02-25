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

interface PopularPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export default async function PopularPage({ searchParams }: PopularPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  let movies: MovieCardData[] = [];
  let totalPages = 1;
  let total = 0;
  let error: string | null = null;

  try {
    const response = await apiService.getPopularMovies({
      page: currentPage,
      limit: DEFAULT_MOVIE_PAGE_SIZE,
      language,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch popular movies");
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
      title={isVietnamese ? "Phim phổ biến" : "Popular Movies"}
      description={
        total > 0
          ? isVietnamese
            ? `${total} phim phổ biến`
            : `${total} popular movies`
          : ""
      }
      total={total}
      items={movies}
      totalPages={totalPages}
      currentPage={currentPage}
      basePath="/movies/popular"
      emptyMessage={
        isVietnamese ? "Không tìm thấy phim phổ biến" : "No popular movies found"
      }
      totalItemsLabel={isVietnamese ? "mục" : "items"}
      error={error}
    />
  );
}
