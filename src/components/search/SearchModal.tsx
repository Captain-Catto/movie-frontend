"use client";

import React, { useEffect, useRef } from "react";
import { X, Search as SearchIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RecentSearch } from "@/types/search";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import RecentSearches from "./RecentSearches";
import SearchTabs from "./SearchTabs";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useSearch } from "@/hooks/useSearch";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { language } = useLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");

  const {
    searches: recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  } = useRecentSearches(user);

  const {
    query,
    setQuery,
    results,
    isLoading,
    selectedType,
    setSelectedType,
    hasMore,
    loadMore,
  } = useSearch();

  // Close modal on Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      // ESC key and focus only - no touch scroll lock
      document.addEventListener("keydown", handleEscape);

      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim()) {
      await addSearch(searchQuery, selectedType);
    }
  };

  const handleRecentSearchClick = (recentSearch: RecentSearch) => {
    setQuery(recentSearch.query);
    setSelectedType(recentSearch.type);
  };

  const handleResultClick = () => {
    // ✅ Save to recent searches when user clicks a search result
    if (query.trim().length >= 2) {
      handleSearch(query);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      style={{
        zIndex: 99999,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(12px)", // Add inline backup
      }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <SearchIcon className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">
              {isVietnamese ? "Tìm kiếm" : "Search"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-700">
          <SearchInput
            ref={inputRef}
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
          />

          {/* Search Tabs */}
          <div className="mt-4">
            <SearchTabs
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {query.length === 0 ? (
            // Recent Searches
            <RecentSearches
              searches={recentSearches}
              onSearchClick={handleRecentSearchClick}
              onRemoveSearch={removeSearch}
              onClearAll={clearSearches}
            />
          ) : (
            // Search Results
            <SearchResults
              results={results}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onClose={onClose}
              onResultClick={handleResultClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
