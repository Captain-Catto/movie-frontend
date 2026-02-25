"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SearchResult } from "@/types/search";
import { API_BASE_URL } from "@/services/api";
import { useDebounce } from "./core/useDebounce";
import { analyticsService } from "@/services/analytics.service";

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  selectedType: "movie" | "tv" | "all";
  setSelectedType: (type: "movie" | "tv" | "all") => void;
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  clearResults: () => void;
}

const LOADING_DELAY = 200; // Only show loading if search takes > 200ms
const MIN_LOADING_TIME = 300; // Keep loading visible for at least 300ms to prevent flash

export const useSearch = (): UseSearchReturn => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"movie" | "tv" | "all">(
    "all"
  );
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minLoadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchStartTimeRef = useRef<number>(0);

  // Use debounce hook instead of manual implementation
  const debouncedQuery = useDebounce(query, 600);

  const searchAPI = useCallback(
    async (searchQuery: string, searchType: string, pageNum: number = 1) => {
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
        setIsLoading(true);
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

        const response = await fetch(
          `${API_BASE_URL}/search?${params.toString()}`
        );
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
                mediaType: item.media_type || "movie",
              }))
            : [];

          // Calculate how long the search took
          const searchDuration = Date.now() - searchStartTimeRef.current;

          // Function to update results
          const updateResults = () => {
            if (pageNum === 1) {
              setResults(processedResults);
              // Track search analytics on first page of results
              if (processedResults.length > 0) {
                analyticsService.trackSearch(
                  searchQuery.trim(),
                  pagination.total || processedResults.length
                );
              }
            } else {
              setResults((prev) => [...prev, ...processedResults]);
            }

            setHasMore(pagination.page < pagination.totalPages);
            setPage(pagination.page);
            setIsLoading(false);
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
          setIsLoading(false);
          if (pageNum === 1) {
            setResults([]);
          }
          setHasMore(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
        }
        setIsLoading(false);
        if (pageNum === 1) {
          setResults([]);
        }
        setHasMore(false);
        setPage(1);
      }
    },
    []
  );

  // Search when debounced query or type changes
  useEffect(() => {
    // Clear results immediately if query is too short
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setHasMore(false);
      setPage(1);
      setIsLoading(false);
      // Clear any pending timers
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (minLoadingTimerRef.current) {
        clearTimeout(minLoadingTimerRef.current);
      }
      return;
    }

    // Trigger search after debounce
    // Don't clear results here - keep previous results visible while loading
    searchAPI(debouncedQuery, selectedType, 1);
  }, [debouncedQuery, selectedType, searchAPI]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (minLoadingTimerRef.current) {
        clearTimeout(minLoadingTimerRef.current);
      }
    };
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && query.trim().length >= 2) {
      searchAPI(query, selectedType, page + 1);
    }
  }, [hasMore, isLoading, query, selectedType, page, searchAPI]);

  const clearResults = useCallback(() => {
    setResults([]);
    setHasMore(false);
    setPage(1);
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
