import type { Metadata } from "next";
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
import { getTrendingPageData } from "@/lib/public-page-data";
import {
  getCommonUiMessages,
  getPublicListingUiMessages,
} from "@/lib/ui-messages";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

interface TrendingPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/trending",
    language,
    fallback: seo.trending,
  });
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const common = getCommonUiMessages(language);
  const listing = getPublicListingUiMessages(language);

  const { items: trending, totalPages, error } = await getTrendingPageData(
    currentPage,
    language
  );

  return (
    <Layout>
      <Container withHeaderOffset>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-8">
            {listing.trendingTitle}
          </h1>
          <MovieFilters className="mb-8" />

          {error && (
            <StatusBanner
              className="mb-4"
              message={`${common.errorPrefix} ${error}`}
            />
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
