import type { TVSeries } from "@/types/content.types";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieGrid from "@/components/movie/MovieGrid";
import MovieFilters from "@/components/movie/MovieFilters";
import LinkPagination from "@/components/ui/LinkPagination";
import type { MovieCardData } from "@/types/content.types";
import { apiService } from "@/services/api";
import { DEFAULT_TV_PAGE_SIZE } from "@/constants/app.constants";
import { mapTVSeriesToFrontendList } from "@/utils/tvMapper";
import {
  extractCategoryItems,
  extractCategoryPagination,
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";

interface TVShowsPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export default async function TVShowsPage({ searchParams }: TVShowsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();

  let tvShows: MovieCardData[] = [];
  let totalPages = 1;
  let error: string | null = null;

  try {
    const response = await apiService.getTVSeries({
      page: currentPage,
      limit: DEFAULT_TV_PAGE_SIZE,
      language,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch TV series");
    }

    const items = extractCategoryItems(response.data);
    tvShows = mapTVSeriesToFrontendList(items as TVSeries[]);

    const pagination = extractCategoryPagination(response, tvShows.length);
    totalPages = pagination.totalPages;
  } catch (err) {
    error = err instanceof Error ? err.message : "An error occurred";
  }

  return (
    <Layout>
      <Container withHeaderOffset>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-8">📺 TV Series</h1>

          {/* Filter Component */}
          <div className="mb-8">
            <MovieFilters />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              Error: {error}
            </div>
          )}
        </div>

        <MovieGrid
          movies={tvShows}
          showFilters={false}
          containerPadding={false}
        />

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <LinkPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/tv"
            />
          </div>
        )}
      </Container>
    </Layout>
  );
}
