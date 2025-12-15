// Shared hook for category/listing pages (movies/TV)
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MovieQuery } from "@/types/movie";
import type { MovieCardData } from "@/types/movie";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_MOVIE_PAGE_SIZE,
} from "@/constants/app.constants";

type CategoryResponse = {
  success: boolean;
  data?: unknown;
  pagination?: {
    totalPages?: number;
    total?: number;
    totalItems?: number;
    total_results?: number;
  };
  message?: string;
};

type UseMovieCategoryOptions<Response extends CategoryResponse> = {
  basePath?: string;
  fetcher: (query: MovieQuery) => Promise<Response>;
  mapper: (items: Array<Record<string, unknown>>) => MovieCardData[];
  defaultLimit?: number;
  defaultLanguage?: string;
  additionalQuery?: Partial<MovieQuery>;
};

const EMPTY_QUERY: Partial<MovieQuery> = {};

const normalizePagination = (pagination?: Record<string, unknown>) => {
  const totalPages =
    typeof pagination?.totalPages === "number"
      ? pagination.totalPages
      : typeof pagination?.total_pages === "number"
      ? (pagination.total_pages as number)
      : 1;

  const total =
    typeof pagination?.total === "number"
      ? pagination.total
      : typeof pagination?.totalItems === "number"
      ? (pagination.totalItems as number)
      : typeof pagination?.total_results === "number"
      ? (pagination.total_results as number)
      : 0;

  return { totalPages, total };
};

const extractItems = (response: CategoryResponse) => {
  const data = (response as CategoryResponse).data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const nestedData = (data as Record<string, unknown>).data;
    if (Array.isArray(nestedData)) return nestedData;
    const nestedResults = (data as Record<string, unknown>).results;
    if (Array.isArray(nestedResults)) return nestedResults;
  }
  return [];
};

const extractPagination = (response: CategoryResponse) => {
  if (response.pagination) return response.pagination;
  const data = response.data;
  if (data && typeof data === "object" && "pagination" in data) {
    return (data as Record<string, unknown>).pagination as
      | Record<string, unknown>
      | undefined;
  }
  return undefined;
};

export function useMovieCategory<Response extends CategoryResponse>({
  basePath,
  fetcher,
  mapper,
  defaultLimit = DEFAULT_MOVIE_PAGE_SIZE,
  defaultLanguage = DEFAULT_LANGUAGE,
  additionalQuery,
}: UseMovieCategoryOptions<Response>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fetcherRef = useRef(fetcher);
  const mapperRef = useRef(mapper);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    mapperRef.current = mapper;
  }, [mapper]);

  const currentPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    const parsed = pageParam ? parseInt(pageParam, 10) : 1;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);

  const normalizedAdditionalQuery = useMemo(
    () => additionalQuery ?? EMPTY_QUERY,
    [additionalQuery]
  );

  const query = useMemo(
    () => ({
      page: currentPage,
      limit: defaultLimit,
      language: defaultLanguage,
      ...normalizedAdditionalQuery,
    }),
    [normalizedAdditionalQuery, currentPage, defaultLanguage, defaultLimit]
  );

  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetcherRef.current(query);
        if (!response.success) {
          throw new Error(response.message || "Failed to fetch category data");
        }

        const items = extractItems(response);
        const mapped = mapperRef.current(
          items as Array<Record<string, unknown>>
        );
        if (isMounted) {
          setMovies(mapped);
          const pagination = extractPagination(response);
          const { totalPages, total } = normalizePagination(pagination);
          setTotalPages(totalPages || 1);
          setTotal(total);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load category data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setMovies([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [query]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (!basePath) return;
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const queryString = params.toString();
      router.replace(
        `${basePath}${queryString ? `?${queryString}` : ""}`,
        { scroll: false }
      );
    },
    [basePath, router, searchParams]
  );

  return {
    movies,
    loading,
    error,
    totalPages,
    total,
    currentPage,
    handlePageChange,
  };
}

export default useMovieCategory;
