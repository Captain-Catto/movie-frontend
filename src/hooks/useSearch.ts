"use client";

import { useState, useCallback, useEffect } from "react";
import { SearchResult } from "@/types/search";
import { API_BASE_URL } from "@/services/api";

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

export const useSearch = (): UseSearchReturn => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"movie" | "tv" | "all">(
    "all"
  );
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const searchAPI = useCallback(
    async (searchQuery: string, searchType: string, pageNum: number = 1) => {
      try {
        setIsLoading(true);

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

          // Backend trả về data đúng format rồi, chỉ cần map để set mediaType
          const processedResults: SearchResult[] = Array.isArray(responseData)
            ? responseData.map((item: SearchResult) => ({
                ...item,
                id: item.id?.toString() || item.tmdbId?.toString(),
                mediaType: item.media_type || "movie",
              }))
            : [];

          if (pageNum === 1) {
            setResults(processedResults);
          } else {
            setResults((prev) => [...prev, ...processedResults]);
          }

          setHasMore(pagination.page < pagination.totalPages);
          setPage(pagination.page);
        } else {
          console.error("Search API error:", data.message || "Unknown error");
          setResults([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        setHasMore(false);
        setPage(1);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Search when query or type changes
  useEffect(() => {
    if (query.trim().length >= 2) {
      searchAPI(query, selectedType, 1);
    } else {
      setResults([]);
      setHasMore(false);
      setPage(1);
    }
  }, [query, selectedType, searchAPI]);

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
