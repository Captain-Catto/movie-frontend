"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import MoviesGrid from "@/components/movie/MoviesGrid";
import type { MovieCardData } from "@/types/content.types";
import { apiService } from "@/services/api";
import { mapTVSeriesToFrontend } from "@/utils/tvMapper";
import type { ApiResponse } from "@/types/api";
import type { TVSeries } from "@/types/content.types";
import { DEFAULT_TV_PAGE_SIZE } from "@/constants/app.constants";
import { useLanguage } from "@/contexts/LanguageContext";

type CategoryKey = "on-the-air" | "popular" | "top-rated";

interface TvCategoryPageProps {
  category: CategoryKey;
  title: string;
  description: string;
}

const fetchers: Record<
  CategoryKey,
  (query?: {
    page?: number;
    limit?: number;
    language?: string;
  }) => Promise<ApiResponse<TVSeries[]>>
> = {
  "on-the-air": apiService.getOnTheAirTVSeries.bind(apiService),
  popular: apiService.getPopularTVSeries.bind(apiService),
  "top-rated": apiService.getTopRatedTVSeries.bind(apiService),
};

const TvCategoryPage = ({
  category,
  title,
  description,
}: TvCategoryPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const initialPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [tvShows, setTvShows] = useState<MovieCardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        const response = await fetchers[category]({
          page: currentPage,
          limit: DEFAULT_TV_PAGE_SIZE,
          language,
        });

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch TV series.");
        }

        // response.data is TVSeries[] (flat array from API)
        // Backend may also return nested { data: TVSeries[], pagination } in some cases
        const rawData = response.data as unknown;
        const seriesArray = Array.isArray(rawData)
          ? rawData
          : ((rawData as Record<string, unknown>)?.data as unknown[]) || [];

        const mapped = seriesArray.map((item) =>
          mapTVSeriesToFrontend(item as Record<string, unknown>)
        );
        setTvShows(mapped);

        // Get pagination from response root or nested data
        const paginationSource = response.pagination
          ?? (!Array.isArray(rawData) ? (rawData as Record<string, unknown>)?.pagination as { totalPages?: number } | undefined : undefined);
        setTotalPages(
          paginationSource?.totalPages && Number.isFinite(paginationSource.totalPages)
            ? Number(paginationSource.totalPages)
            : 1
        );
      } catch (err) {
        console.error(`Error fetching ${category} TV shows:`, err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
        setTvShows([]);
        setTotalPages(1);
      }
    };

    fetchData();
  }, [category, currentPage, language]);

  const handlePageChange = (page: number) => {
    const safePage = Math.max(1, page);
    setCurrentPage(safePage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", safePage.toString());
    router.replace(`/tv/${category}?${params.toString()}`, { scroll: false });
  };

  return (
    <Layout>
      <Container withHeaderOffset>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400 mb-6 max-w-3xl">{description}</p>

          {error && (
            <div className="mb-6 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <MoviesGrid
          title=""
          movies={tvShows}
          className=""
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Container>
    </Layout>
  );
};

export default TvCategoryPage;
