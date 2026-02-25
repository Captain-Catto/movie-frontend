import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieFilters from "@/components/movie/MovieFilters";
import MovieCard from "@/components/movie/MovieCard";
import LinkPagination from "@/components/ui/LinkPagination";
import { getServerPreferredLanguage } from "@/lib/server-language";
import type { SearchParamsRecord } from "@/lib/category-page-data";
import {
  getBrowsePageData,
  getBrowsePageTitleByLanguage,
  parseBrowsePageParams,
} from "@/lib/browse-page-data";

interface BrowsePageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const { currentPage, fetchType, currentFilters, paginationQuery } =
    parseBrowsePageParams(params);
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  const { items: movies, totalPages, error } = await getBrowsePageData({
    currentPage,
    fetchType,
    language,
    filters: currentFilters,
  });

  return (
    <Layout>
      <Container withHeaderOffset>
        <h1 className="text-3xl font-bold text-white mb-8">
          {getBrowsePageTitleByLanguage(fetchType, language)}
        </h1>

        {/* Filter Component */}
        <div className="mb-8">
          <MovieFilters initialFilters={currentFilters} />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-6">
            {isVietnamese ? "Lỗi:" : "Error:"} {error}
          </div>
        )}

        {movies.length > 0 ? (
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
                {isVietnamese ? "Không tìm thấy nội dung" : "No movies found"}
              </h3>
              <p>
                {isVietnamese
                  ? "Không có nội dung phù hợp với bộ lọc hiện tại."
                  : "No movies found with the current filters."}
              </p>
              <p className="text-sm mt-2">
                {isVietnamese
                  ? "Hãy thử thay đổi bộ lọc để xem kết quả khác."
                  : "Try changing the filters to see different results."}
              </p>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <LinkPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/browse"
              queryParams={paginationQuery}
            />
          </div>
        )}
      </Container>
    </Layout>
  );
}
