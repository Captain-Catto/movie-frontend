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

interface PopularTVPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export default async function PopularTVPage({
  searchParams,
}: PopularTVPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  let tvShows: MovieCardData[] = [];
  let totalPages = 1;
  let total = 0;
  let error: string | null = null;

  try {
    const response = await apiService.getPopularTVSeries({
      page: currentPage,
      limit: DEFAULT_TV_PAGE_SIZE,
      language,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch popular TV shows");
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
      title={isVietnamese ? "Phim bộ phổ biến" : "Popular TV Shows"}
      description={
        isVietnamese
          ? "Khám phá các phim bộ được khán giả xem và bàn luận nhiều nhất."
          : "Discover the TV shows audiences are watching and talking about the most."
      }
      total={total}
      items={tvShows}
      totalPages={totalPages}
      currentPage={currentPage}
      basePath="/tv/popular"
      emptyMessage={
        isVietnamese
          ? "Không tìm thấy phim bộ phổ biến"
          : "No popular TV shows found"
      }
      totalItemsLabel={isVietnamese ? "mục" : "items"}
      error={error}
    />
  );
}
