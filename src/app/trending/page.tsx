import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieGrid from "@/components/movie/MovieGrid";
import MovieFilters from "@/components/movie/MovieFilters";
import LinkPagination from "@/components/ui/LinkPagination";
import { apiService } from "@/services/api";
import { mapTrendingDataToFrontend } from "@/utils/trendingMapper";
import type { MovieCardData } from "@/types/content.types";
import { DEFAULT_BROWSE_PAGE_SIZE } from "@/constants/app.constants";
import {
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";

interface TrendingPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();

  let trending: MovieCardData[] = [];
  let totalPages = 1;
  let error: string | null = null;

  try {
    const response = await apiService.getTrending({
      page: currentPage,
      limit: DEFAULT_BROWSE_PAGE_SIZE,
      language,
    });

    if (response.success && response.data) {
      trending = mapTrendingDataToFrontend(response.data);

      if (response.pagination?.totalPages) {
        totalPages = response.pagination.totalPages;
      } else {
        totalPages = 1;
      }
    } else {
      throw new Error(response.message || "Failed to fetch trending data");
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "An error occurred";
  }

  return (
    <Layout>
      <Container withHeaderOffset>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-8">🔥 Trending</h1>
          <MovieFilters className="mb-8" />

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              Error: {error}
            </div>
          )}
        </div>

        <MovieGrid
          movies={trending}
          showFilters={false}
          containerPadding={false}
        />

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <LinkPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/trending"
            />
          </div>
        )}
      </Container>
    </Layout>
  );
}
