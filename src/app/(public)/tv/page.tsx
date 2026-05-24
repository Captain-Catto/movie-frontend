import type { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieGrid from "@/components/movie/MovieGrid";
import MovieFilters from "@/components/movie/MovieFilters";
import LinkPagination from "@/components/ui/LinkPagination";
import StatusBanner from "@/components/ui/StatusBanner";
import TVSearchInput from "@/components/tv/TVSearchInput";
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
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";
import { buildStaticPageMetadataExtras } from "@/lib/static-page-metadata";

interface TVShowsPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/tv",
    language,
    fallback: seo.tv,
    extras: buildStaticPageMetadataExtras("tv", "/tv", seo.tv),
  });
}

export default async function TVShowsPage({ searchParams }: TVShowsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const query = typeof params?.q === "string" ? params.q : "";
  const language = await getServerPreferredLanguage();
  const common = getCommonUiMessages(language);
  const listing = getPublicListingUiMessages(language);

  const { items: tvShows, totalPages, error } = await getTVPageData(
    currentPage,
    language,
    query
  );

  return (
    <Layout>
      <Container withHeaderOffset>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-semibold text-white">
              {listing.tvSeriesTitle}
            </h1>
            <TVSearchInput
              initialQuery={query}
              placeholder={language === "vi" ? "Tìm kiếm TV series..." : "Search TV series..."}
            />
          </div>

          {/* Filter Component — hidden when searching */}
          {!query && (
            <div className="mb-8">
              <MovieFilters />
            </div>
          )}

          {query && (
            <p className="text-gray-400 text-sm mb-6">
              {language === "vi"
                ? `Kết quả tìm kiếm cho "${query}" — ${tvShows.length} kết quả`
                : `Search results for "${query}" — ${tvShows.length} results`}
            </p>
          )}

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
