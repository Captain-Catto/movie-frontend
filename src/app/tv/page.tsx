import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieGrid from "@/components/movie/MovieGrid";
import MovieFilters from "@/components/movie/MovieFilters";
import LinkPagination from "@/components/ui/LinkPagination";
import StatusBanner from "@/components/ui/StatusBanner";
import {
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getTVPageData } from "@/lib/public-page-data";
import {
  getCommonUiMessages,
  getPublicListingUiMessages,
} from "@/lib/ui-messages";

interface TVShowsPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export default async function TVShowsPage({ searchParams }: TVShowsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const common = getCommonUiMessages(language);
  const listing = getPublicListingUiMessages(language);

  const { items: tvShows, totalPages, error } = await getTVPageData(
    currentPage,
    language
  );

  return (
    <Layout>
      <Container withHeaderOffset>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-8">
            {listing.tvSeriesTitle}
          </h1>

          {/* Filter Component */}
          <div className="mb-8">
            <MovieFilters />
          </div>

          {error && (
            <StatusBanner
              className="mb-4"
              message={`${common.errorPrefix} ${error}`}
            />
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
