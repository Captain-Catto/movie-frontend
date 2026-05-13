import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import PeopleGrid from "@/components/people/PeopleGrid";
import LinkPagination from "@/components/ui/LinkPagination";
import {
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getPeoplePageData } from "@/lib/public-page-data";
import { getPeopleUiMessages } from "@/lib/ui-messages";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

interface PeoplePageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/people",
    language,
    fallback: seo.people,
  });
}

const PeoplePage = async ({ searchParams }: PeoplePageProps) => {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const rawSearchQuery = params?.q;
  const searchQuery = Array.isArray(rawSearchQuery)
    ? rawSearchQuery[0] || ""
    : rawSearchQuery || "";
  const language = await getServerPreferredLanguage();
  const labels = getPeopleUiMessages(language);
  const isVietnamese = language.toLowerCase().startsWith("vi");

  const { items: people, totalPages, error } = await getPeoplePageData(
    currentPage,
    searchQuery
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <Container withHeaderOffset>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {labels.pageTitle}
            </h1>
            <p className="text-gray-400">
              {labels.pageSubtitle}
            </p>
          </div>

          <form action="/people" className="mb-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder={isVietnamese ? "Tìm diễn viên, đạo diễn..." : "Search actors, directors..."}
              className="h-11 flex-1 rounded-md border border-gray-700 bg-gray-800 px-4 text-sm text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              type="submit"
              className="h-11 rounded-md bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              {isVietnamese ? "Tìm kiếm" : "Search"}
            </button>
            {searchQuery && (
              <Link
                href="/people"
                className="inline-flex h-11 items-center justify-center rounded-md bg-gray-800 px-4 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700"
              >
                {isVietnamese ? "Xóa" : "Clear"}
              </Link>
            )}
          </form>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <PeopleGrid people={people} loading={false} />

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <LinkPagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/people"
                queryParams={{ q: searchQuery }}
              />
            </div>
          )}
        </Container>
      </div>
    </Layout>
  );
};

export default PeoplePage;
