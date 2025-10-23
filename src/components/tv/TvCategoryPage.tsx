"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import MoviesGrid from "@/components/movie/MoviesGrid";
import { MovieCardData } from "@/components/movie/MovieCard";
import { apiService } from "@/services/api";
import { mapTVSeriesToFrontend } from "@/utils/tvMapper";

type CategoryKey = "on-the-air" | "popular" | "top-rated";

interface TvCategoryPageProps {
  category: CategoryKey;
  title: string;
  description: string;
}

const fetchers: Record<
  CategoryKey,
  (query?: { page?: number; limit?: number; language?: string }) => Promise<any>
> = {
  "on-the-air": apiService.getOnTheAirTVSeries.bind(apiService),
  popular: apiService.getPopularTVSeries.bind(apiService),
  "top-rated": apiService.getTopRatedTVSeries.bind(apiService),
};

const TvCategoryPage = ({ category, title, description }: TvCategoryPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [tvShows, setTvShows] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchers[category]({
          page: currentPage,
          limit: 24,
          language: "en-US",
        });

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch TV series.");
        }

        const payload = response.data as any;
        const seriesArray: any[] = Array.isArray(payload)
          ? payload
          : payload?.data || [];

        const mapped = seriesArray.map((item: any) =>
          mapTVSeriesToFrontend(item)
        );
        setTvShows(mapped);

        const pagination = payload?.pagination;
        setTotalPages(pagination?.totalPages || 1);
      } catch (err) {
        console.error(`Error fetching ${category} TV shows:`, err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
        setTvShows([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, currentPage]);

  const handlePageChange = (page: number) => {
    const safePage = Math.max(1, page);
    setCurrentPage(safePage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", safePage.toString());
    router.replace(`/tv/${category}?${params.toString()}`, { scroll: false });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-16">
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
        className="py-8"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Layout>
  );
};

export default TvCategoryPage;
