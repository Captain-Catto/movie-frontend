"use client";

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Options for usePagination hook
 */
export interface UsePaginationOptions {
  /** Base path for navigation (e.g., '/movies', '/browse') */
  basePath?: string;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Whether to scroll to top on page change (default: false) */
  scrollOnChange?: boolean;
}

/**
 * Result returned by usePagination hook
 */
export interface UsePaginationResult {
  /** Current page number from URL params */
  page: number;
  /** Navigate to specific page */
  goToPage: (page: number) => void;
  /** Navigate to next page */
  nextPage: () => void;
  /** Navigate to previous page */
  prevPage: () => void;
  /** Check if on first page */
  isFirstPage: boolean;
  /** Check if on last page (requires totalPages) */
  isLastPage: (totalPages: number) => boolean;
}

/**
 * Hook for managing URL-based pagination with Next.js router
 * Reads page from URL query params and provides navigation functions
 *
 * @example
 * ```tsx
 * function MoviesList() {
 *   const { page, goToPage, nextPage, prevPage, isFirstPage } = usePagination({
 *     basePath: '/movies',
 *   });
 *
 *   const { data, totalPages } = useMoviesQuery({ page });
 *
 *   return (
 *     <div>
 *       <MovieGrid movies={data} />
 *
 *       <div className="pagination">
 *         <button onClick={prevPage} disabled={isFirstPage}>
 *           Previous
 *         </button>
 *         <span>Page {page} of {totalPages}</span>
 *         <button onClick={nextPage} disabled={page >= totalPages}>
 *           Next
 *         </button>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationResult {
  const {
    basePath,
    initialPage = 1,
    scrollOnChange = false,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current page from URL params
  const page = useMemo(() => {
    const pageParam = searchParams.get('page');
    const parsed = pageParam ? parseInt(pageParam, 10) : initialPage;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : initialPage;
  }, [searchParams, initialPage]);

  // Navigate to specific page
  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage < 1) return;

      const params = new URLSearchParams(searchParams.toString());

      // Remove page param if going to first page for cleaner URLs
      if (newPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', newPage.toString());
      }

      const queryString = params.toString();
      const url = basePath
        ? `${basePath}${queryString ? `?${queryString}` : ''}`
        : `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;

      router.push(url, { scroll: scrollOnChange });
    },
    [basePath, router, searchParams, scrollOnChange]
  );

  // Navigate to next page
  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  // Navigate to previous page
  const prevPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1);
    }
  }, [page, goToPage]);

  // Check if on first page
  const isFirstPage = page === 1;

  // Check if on last page (requires totalPages from API)
  const isLastPage = useCallback(
    (totalPages: number) => page >= totalPages,
    [page]
  );

  return {
    page,
    goToPage,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
  };
}
