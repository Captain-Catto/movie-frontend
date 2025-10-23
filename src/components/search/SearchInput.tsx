"use client";

import React, { forwardRef, useCallback, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ query, onQueryChange, onSearch, isLoading }, ref) => {
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Custom debounce implementation
    const debouncedSearch = useCallback(
      (searchQuery: string) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          if (searchQuery.trim().length >= 2) {
            onSearch(searchQuery);
          }
        }, 300);
      },
      [onSearch]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      onQueryChange(newQuery);
      debouncedSearch(newQuery);
    };

    const handleClear = () => {
      onQueryChange("");
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim().length >= 2) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        onSearch(query);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-5 h-5 text-gray-400" />

          <input
            ref={ref}
            type="text"
            placeholder="Tìm kiếm phim, TV shows..."
            value={query}
            onChange={handleInputChange}
            className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
          />

          {/* Loading or Clear button */}
          <div className="absolute right-3">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )
            )}
          </div>
        </div>

        {query.length > 0 && query.length < 2 && (
          <p className="text-xs text-gray-400 mt-2">
            Nhập ít nhất 2 ký tự để tìm kiếm
          </p>
        )}
      </form>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
