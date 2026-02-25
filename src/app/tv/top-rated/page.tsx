import CategoryListingPage from "@/components/content/CategoryListingPage";
import { DEFAULT_TV_PAGE_SIZE } from "@/constants/app.constants";
import {
  extractCategoryItems,
  extractCategoryPagination,
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { apiService } from "@/services/api";
import type { MovieCardData, TVSeries } from "@/types/content.types";
import { mapTVSeriesToFrontendList } from "@/utils/tvMapper";

interface TopRatedTVPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export default async function TopRatedTVPage({
  searchParams,
}: TopRatedTVPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  let tvShows: MovieCardData[] = [];
  let totalPages = 1;
  let total = 0;
  let error: string | null = null;

  try {
    const response = await apiService.getTopRatedTVSeries({
      page: currentPage,
      limit: DEFAULT_TV_PAGE_SIZE,
      language,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch top rated TV shows");
    }

    const items = extractCategoryItems(response.data);
    tvShows = mapTVSeriesToFrontendList(items as TVSeries[]);

    const pagination = extractCategoryPagination(response, tvShows.length);
    totalPages = pagination.totalPages;
    total = pagination.total;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <CategoryListingPage
      title={isVietnamese ? "Phim bộ đánh giá cao" : "Top Rated TV Shows"}
      description={
        isVietnamese
          ? "Các series được giới phê bình và khán giả đánh giá nổi bật."
          : "Critically acclaimed series with outstanding ratings from viewers."
      }
      total={total}
      items={tvShows}
      totalPages={totalPages}
      currentPage={currentPage}
      basePath="/tv/top-rated"
      emptyMessage={
        isVietnamese
          ? "Không tìm thấy phim bộ đánh giá cao"
          : "No top rated TV shows found"
      }
      totalItemsLabel={isVietnamese ? "mục" : "items"}
      error={error}
    />
  );
}
