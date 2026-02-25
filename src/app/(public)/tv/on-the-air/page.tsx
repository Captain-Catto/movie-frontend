import type { Metadata } from "next";
import CategoryListingPage from "@/components/content/CategoryListingPage";
import { DEFAULT_TV_PAGE_SIZE } from "@/constants/app.constants";
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
import type { MovieCardData, TVSeries } from "@/types/content.types";
import { mapTVSeriesToFrontendList } from "@/utils/tvMapper";
import { getCategorySeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

interface OnTheAirTVPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getCategorySeo("tv-on-the-air", language);

  return resolvePageMetadata({
    path: "/tv/on-the-air",
    language,
    fallback: seo,
  });
}

export default async function OnTheAirTVPage({
  searchParams,
}: OnTheAirTVPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const uiLabels = getCategoryFetchErrorUiMessages(language);

  let tvShows: MovieCardData[] = [];
  let totalPages = 1;
  let total = 0;
  let error: string | null = null;

  try {
    const response = await apiService.getOnTheAirTVSeries({
      page: currentPage,
      limit: DEFAULT_TV_PAGE_SIZE,
      language,
    });

    if (!response.success) {
      throw new Error(response.message || uiLabels.failedToFetchOnTheAirTVShows);
    }

    const items = extractCategoryItems(response.data);
    tvShows = mapTVSeriesToFrontendList(items as TVSeries[]);

    const pagination = extractCategoryPagination(response, tvShows.length);
    totalPages = pagination.totalPages;
    total = pagination.total;
  } catch (err) {
    error = err instanceof Error ? err.message : uiLabels.unknownError;
  }
  const labels = getCategoryListingUiMessages("tv-on-the-air", language, total);

  return (
    <CategoryListingPage
      title={labels.title}
      description={labels.description}
      total={total}
      items={tvShows}
      totalPages={totalPages}
      currentPage={currentPage}
      basePath="/tv/on-the-air"
      emptyMessage={labels.emptyMessage}
      totalItemsLabel={labels.totalItemsLabel}
      error={error}
    />
  );
}
