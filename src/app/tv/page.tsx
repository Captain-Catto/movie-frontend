import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieGrid from "@/components/movie/MovieGrid";
import MovieFilters from "@/components/movie/MovieFilters";
import LinkPagination from "@/components/ui/LinkPagination";
import {
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getTVPageData } from "@/lib/public-page-data";

interface TVShowsPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export default async function TVShowsPage({ searchParams }: TVShowsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  const { items: tvShows, totalPages, error } = await getTVPageData(
    currentPage,
    language
  );

  return (
    <Layout>
      <Container withHeaderOffset>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-8">
            {isVietnamese ? "📺 Phim bộ" : "📺 TV Series"}
          </h1>

          {/* Filter Component */}
          <div className="mb-8">
            <MovieFilters />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              {isVietnamese ? "Lỗi:" : "Error:"} {error}
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
