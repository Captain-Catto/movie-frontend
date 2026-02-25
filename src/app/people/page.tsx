import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import PeopleGrid from "@/components/people/PeopleGrid";
import LinkPagination from "@/components/ui/LinkPagination";
import Link from "next/link";
import {
  parsePageParam,
  type SearchParamsRecord,
} from "@/lib/category-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getPeoplePageData } from "@/lib/public-page-data";

interface PeoplePageProps {
  searchParams?: Promise<SearchParamsRecord> | SearchParamsRecord;
}

const PeoplePage = async ({ searchParams }: PeoplePageProps) => {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageParam(params?.page);
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const viewMoreLabel = isVietnamese ? "Xem thêm" : "View More";

  const { items: people, totalPages, error } = await getPeoplePageData(
    currentPage
  );
  const hasNextPage = currentPage < totalPages;
  const nextPageHref = `/people?page=${currentPage + 1}`;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <Container withHeaderOffset>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isVietnamese ? "Diễn viên & Đạo diễn" : "Actors & Directors"}
            </h1>
            <p className="text-gray-400">
              {isVietnamese
                ? "Khám phá thế giới diễn viên và nhà làm phim"
                : "Explore a whole world of actors and filmmakers"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <PeopleGrid people={people} loading={false} />

          {!error && people.length > 0 && hasNextPage && (
            <div className="mt-8 flex justify-center">
              <Link
                href={nextPageHref}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                {viewMoreLabel}
              </Link>
            </div>
          )}

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
