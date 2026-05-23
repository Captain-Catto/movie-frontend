"use client";

import { useState, useCallback, useEffect, useReducer, useRef } from "react";
import { SearchResult } from "@/types/search";
import type { SearchFilterType } from "@/types/search";
import { API_BASE_URL } from "@/services/api";
import { useDebounce } from "./core/useDebounce";
import { analyticsService } from "@/services/analytics.service";

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  selectedType: SearchFilterType;
  setSelectedType: (type: SearchFilterType) => void;
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  clearResults: () => void;
}

const LOADING_DELAY = 200; // Only show loading if search takes > 200ms
const MIN_LOADING_TIME = 300; // Keep loading visible for at least 300ms to prevent flash

export const useSearch = (): UseSearchReturn => {
  const [query, setQueryState] = useState("");
  const [selectedType, setSelectedType] = useState<SearchFilterType>("all");
  type SearchState = { results: SearchResult[]; isLoading: boolean; hasMore: boolean; page: number };
  type SearchAction = Partial<SearchState> | ((s: SearchState) => Partial<SearchState>);
  const [searchState, dispatch] = useReducer(
    (s: SearchState, a: SearchAction): SearchState => ({ ...s, ...(typeof a === 'function' ? a(s) : a) }),
    { results: [], isLoading: false, hasMore: false, page: 1 }
  );
  const { results, isLoading, hasMore, page } = searchState;

  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchStartTimeRef = useRef<number>(0);
  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    if (q.trim().length < 2) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      if (minLoadingTimerRef.current) clearTimeout(minLoadingTimerRef.current);
      dispatch({ results: [], hasMore: false, page: 1, isLoading: false });
    }
  }, []);

  // Use debounce hook instead of manual implementation
  const debouncedQuery = useDebounce(query, 600);

  const searchAPI = useCallback(
    async (searchQuery: string, searchType: string, pageNum: number = 1) => {
      activeRequestIdRef.current += 1;
      const requestId = activeRequestIdRef.current;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Clear any pending loading timers
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (minLoadingTimerRef.current) {
        clearTimeout(minLoadingTimerRef.current);
      }

      // Record search start time
      searchStartTimeRef.current = Date.now();

      // Only show loading indicator if search takes longer than LOADING_DELAY
      loadingTimerRef.current = setTimeout(() => {
        dispatch({ isLoading: true });
      }, LOADING_DELAY);

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          page: pageNum.toString(),
          limit: "20",
        });

        if (searchType !== "all") {
          params.append("type", searchType);
        }

        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (data.success && data.data) {
          // Handle nested data structure from backend
          const responseData = data.data.data || data.data || [];
          const pagination = data.data.pagination || {
            page: pageNum,
            totalPages: 1,
          };

          // Backend returns data in correct format, just need to map to set mediaType
          const processedResults: SearchResult[] = Array.isArray(responseData)
            ? responseData.map((item: SearchResult) => ({
                ...item,
                id: item.id?.toString() || item.tmdbId?.toString(),
                tmdbId: item.tmdbId || Number(item.id),
                title: item.title || (item as { name?: string }).name || "",
                originalTitle:
                  item.originalTitle ||
                  (item as { original_name?: string }).original_name,
                posterPath:
                  item.posterPath ||
                  (item as { poster_path?: string }).poster_path ||
                  (item as { profile_path?: string }).profile_path,
                profilePath:
                  item.profilePath || (item as { profile_path?: string }).profile_path,
                mediaType:
                  searchType === "person" ? "person" : item.media_type || "movie",
              }))
            : [];

          // Calculate how long the search took
          const searchDuration = Date.now() - searchStartTimeRef.current;

          // Function to update results
          const updateResults = () => {
            if (requestId !== activeRequestIdRef.current) {
              return;
            }

            if (pageNum === 1) {
              dispatch({ results: processedResults, hasMore: pagination.page < pagination.totalPages, page: pagination.page, isLoading: false });
              if (processedResults.length > 0) {
                analyticsService.trackSearch(
                  searchQuery.trim(),
                  pagination.total || processedResults.length
                );
              }
            } else {
              dispatch((state) => ({
                results: [...state.results, ...processedResults],
                hasMore: pagination.page < pagination.totalPages,
                page: pagination.page,
                isLoading: false,
              }));
            }
          };

          // If loading was shown and minimum time hasn't passed, wait
          if (searchDuration >= LOADING_DELAY && searchDuration < MIN_LOADING_TIME) {
            minLoadingTimerRef.current = setTimeout(
              updateResults,
              MIN_LOADING_TIME - searchDuration
            );
          } else {
            // Clear loading timer if search completed before delay
            if (loadingTimerRef.current) {
              clearTimeout(loadingTimerRef.current);
            }
            updateResults();
          }
        } else {
          console.error("Search API error:", data.message || "Unknown error");
          if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
          }
          dispatch((state) => ({
            results: pageNum === 1 ? [] : state.results,
            hasMore: false,
            isLoading: false,
          }));
        }
      } catch (error) {
        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Search error:", error);
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
        }
        dispatch((state) => ({
          results: pageNum === 1 ? [] : state.results,
          hasMore: false,
          page: 1,
          isLoading: false,
        }));
      }
    },
    []
  );

  // Search when debounced query or type changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) return;
    searchAPI(debouncedQuery, selectedType, 1);
  }, [debouncedQuery, selectedType, searchAPI]);

  // Cleanup timers on unmount
  useEffect(() => {
    const loadTimer = loadingTimerRef.current;
    const minTimer = minLoadingTimerRef.current;
    const abortCtrl = abortControllerRef.current;
    return () => {
      if (loadTimer) clearTimeout(loadTimer);
      if (minTimer) clearTimeout(minTimer);
      if (abortCtrl) abortCtrl.abort();
    };
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && query.trim().length >= 2) {
      searchAPI(query, selectedType, page + 1);
    }
  }, [hasMore, isLoading, query, selectedType, page, searchAPI]);

  const clearResults = useCallback(() => {
    dispatch({ results: [], hasMore: false, page: 1 });
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    selectedType,
    setSelectedType,
    hasMore,
    page,
    loadMore,
    clearResults,
  };
};
