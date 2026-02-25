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
import { getMoviesPageData } from "@/lib/public-page-data";
import {
  getCommonUiMessages,
  getPublicListingUiMessages,
} from "@/lib/ui-messages";
import { getStaticPageSeo } from "@/lib/page-seo";

interface MoviesPageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return {
    title: seo.movies.title,
    description: seo.movies.description,
  };
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const common = getCommonUiMessages(language);
  const listing = getPublicListingUiMessages(language);

  const { items: movies, totalPages, error } = await getMoviesPageData(
    currentPage,
    language
  );

  return (
    <Layout>
      <Container withHeaderOffset>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-8">
            {listing.moviesTitle}
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
          movies={movies}
          showFilters={false}
          containerPadding={false}
        />

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <LinkPagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/movies"
            />
          </div>
        )}
      </Container>
    </Layout>
  );
}
