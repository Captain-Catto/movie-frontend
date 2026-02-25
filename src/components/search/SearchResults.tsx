"use client";

import React from "react";
import { SearchResult } from "@/types/search";
import SearchResultItem from "./SearchResultItem";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSearchUiMessages } from "@/lib/ui-messages";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onClose: () => void;
  onResultClick?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results = [], // Default to empty array
  isLoading,
  hasMore,
  onLoadMore,
  onClose,
  onResultClick,
}) => {
  const { language } = useLanguage();
  const labels = getSearchUiMessages(language);

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

  // Initial loading state (no results yet)
  if (isLoading && safeResults.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-4">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // Empty state - Fixed height to prevent layout shift
  if (!isLoading && safeResults.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-gray-400 font-medium mb-1">
            {labels.noResultsTitle}
          </h3>
          <p className="text-gray-500 text-sm">
            {labels.noResultsDescription}
          </p>
        </div>
      </div>
    );
  }

  // Results with optional loading overlay
  return (
    <div className="h-full overflow-y-auto relative">
      {/* Subtle loading overlay when refreshing results */}
      {isLoading && safeResults.length > 0 && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900/50 backdrop-blur-sm p-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-red-500 rounded-full animate-spin"></div>
              <span>{labels.updating}</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Results count */}
        {safeResults.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400">{labels.foundResults(safeResults.length)}</p>
          </div>
        )}

        {/* Results list */}
        <div className="space-y-2">
          {safeResults.map((result) => (
            <SearchResultItem
              key={`${result.mediaType}-${result.tmdbId}`}
              result={result}
              onClose={onClose}
              onResultClick={onResultClick}
            />
          ))}
        </div>

        {/* Loading more (appending results) */}
        {isLoading && hasMore && (
          <div className="mt-4">
            <LoadingSkeleton />
          </div>
        )}

        {/* Load more button */}
        {!isLoading && hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={onLoadMore}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              {labels.loadMore}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
