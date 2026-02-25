import type { Metadata } from "next";
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
  const language = await getServerPreferredLanguage();
  const labels = getPeopleUiMessages(language);

  const { items: people, totalPages, error } = await getPeoplePageData(
    currentPage
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
              />
            </div>
          )}
        </Container>
      </div>
    </Layout>
  );
};

export default PeoplePage;
