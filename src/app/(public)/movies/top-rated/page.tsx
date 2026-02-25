import type { Metadata } from "next";
import CategoryListingPage from "@/components/content/CategoryListingPage";
import { DEFAULT_MOVIE_PAGE_SIZE } from "@/constants/app.constants";
import {
  extractCategoryItems,
  extractCategoryPagination,
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";
import {
  getCategoryFetchErrorUiMessages,
  getCategoryListingUiMessages,
} from "@/lib/ui-messages";
import { apiService } from "@/services/api";
import type { Movie, MovieCardData } from "@/types/content.types";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { getCategorySeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

interface TopRatedPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getCategorySeo("movies-top-rated", language);

  return resolvePageMetadata({
    path: "/movies/top-rated",
    language,
    fallback: seo,
  });
}

export default async function TopRatedPage({
  searchParams,
}: TopRatedPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const uiLabels = getCategoryFetchErrorUiMessages(language);

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
      throw new Error(response.message || uiLabels.failedToFetchTopRatedMovies);
    }

    const items = extractCategoryItems(response.data);
    movies = mapMoviesToFrontend(items as Movie[]);

    const pagination = extractCategoryPagination(response, movies.length);
    totalPages = pagination.totalPages;
    total = pagination.total;
  } catch (err) {
    error = err instanceof Error ? err.message : uiLabels.unknownError;
  }
  const labels = getCategoryListingUiMessages("movies-top-rated", language, total);

  return (
    <CategoryListingPage
      title={labels.title}
      description={labels.description}
      total={total}
      items={movies}
      totalPages={totalPages}
      currentPage={currentPage}
      basePath="/movies/top-rated"
      emptyMessage={labels.emptyMessage}
      totalItemsLabel={labels.totalItemsLabel}
      error={error}
    />
  );
}
