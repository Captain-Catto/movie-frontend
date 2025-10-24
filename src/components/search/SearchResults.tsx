"use client";

import React from "react";
import { SearchResult } from "@/types/search";
import SearchResultItem from "./SearchResultItem";
import { Search } from "lucide-react";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results = [], // Default to empty array
  isLoading,
  hasMore,
  onLoadMore,
  onClose,
}) => {
  console.log("SearchResults received:", { results, isLoading }); // Debug log

  // Ensure results is always an array
  const safeResults = Array.isArray(results) ? results : [];
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
          <div className="w-16 h-20 bg-gray-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  if (!isLoading && safeResults.length === 0) {
    return (
      <div className="p-6 text-center">
        <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-gray-400 font-medium mb-1">
          Không tìm thấy kết quả
        </h3>
        <p className="text-gray-500 text-sm">Thử tìm kiếm với từ khóa khác</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        {/* Results count */}
        {safeResults.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400">
              Tìm thấy {safeResults.length} kết quả
            </p>
          </div>
        )}

        {/* Results list */}
        <div className="space-y-2">
          {safeResults.map((result) => (
            <SearchResultItem
              key={`${result.mediaType}-${result.tmdbId}`}
              result={result}
              onClose={onClose}
            />
          ))}
        </div>

        {/* Loading more */}
        {isLoading && (
          <div className="mt-4">
            <LoadingSkeleton />
          </div>
        )}

        {/* Load more button */}
        {!isLoading && hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={onLoadMore}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
