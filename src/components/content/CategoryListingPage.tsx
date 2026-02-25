import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MovieGrid from "@/components/movie/MovieGrid";
import LinkPagination from "@/components/ui/LinkPagination";
import type { MovieCardData } from "@/types/content.types";

interface CategoryListingPageProps {
  title: string;
  description?: string;
  total: number;
  items: MovieCardData[];
  totalPages: number;
  currentPage: number;
  basePath: string;
  emptyMessage: string;
  error?: string | null;
}

export default function CategoryListingPage({
  title,
  description,
  total,
  items,
  totalPages,
  currentPage,
  basePath,
  emptyMessage,
  error,
}: CategoryListingPageProps) {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <Container withHeaderOffset>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {description ? (
              <p className="text-gray-400">{description}</p>
            ) : (
              <p className="text-gray-400">{total > 0 && `${total} items`}</p>
            )}
          </div>

          {error ? (
            <div className="mb-6 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {items.length > 0 && (
            <>
              <MovieGrid
                movies={items}
                showFilters={false}
                containerPadding={false}
              />

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <LinkPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath={basePath}
                  />
                </div>
              )}
            </>
          )}

          {!error && items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">{emptyMessage}</p>
            </div>
          )}
        </Container>
      </div>
    </Layout>
  );
}
