"use client";

import React from "react";
import { Clock, X, Trash2 } from "lucide-react";
import { RecentSearch } from "@/types/search";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { ClientOnly } from "@/components/hydration/ClientOnly";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSearchUiMessages, resolveUiLocale } from "@/lib/ui-messages";

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSearchClick: (search: RecentSearch) => void;
  onRemoveSearch: (search: RecentSearch) => void;
  onClearAll: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSearchClick,
  onRemoveSearch,
  onClearAll,
}) => {
  const { language } = useLanguage();
  const labels = getSearchUiMessages(language);
  const locale = resolveUiLocale(language);
  const dateFnsLocale = locale === "vi" ? vi : enUS;

  if (searches.length === 0) {
    return (
      <div className="p-6 text-center">
        <Clock className="size-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-gray-400 font-medium mb-1">
          {labels.noRecentSearches}
        </h3>
        <p className="text-gray-500 text-sm">
          {labels.recentSearchesDescription}
        </p>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "movie":
        return labels.typeLabel("movie");
      case "tv":
        return labels.typeLabel("tv");
      default:
        return labels.typeLabel("all");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "movie":
        return "bg-blue-500/20 text-blue-400";
      case "tv":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center gap-x-2">
            <Clock className="size-4" />
            <span>{labels.recentSearchesTitle}</span>
          </h3>

          {searches.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-x-1 cursor-pointer"
            >
              <Trash2 className="size-3" />
              <span>{labels.clearAll}</span>
            </button>
          )}
        </div>

        <div className="gap-y-2">
          {searches.map((search, index) => (
            <button
              type="button"
              key={search.id || `${search.query}-${index}`}
              className="group flex w-full cursor-pointer items-center justify-between rounded-lg bg-gray-800 p-3 text-left transition-colors hover:bg-gray-700"
              onClick={() => onSearchClick(search)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-x-2">
                  <span className="text-white font-medium truncate">
                    {search.query}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getTypeColor(
                      search.type
                    )}`}
                  >
                    {getTypeLabel(search.type)}
                  </span>
                </div>

                <div className="flex items-center gap-x-2 mt-1">
                  <ClientOnly
                    fallback={
                      <span className="text-xs text-gray-400">
                        {labels.recently}
                      </span>
                    }
                  >
                    <span className="text-xs text-gray-400" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(search.timestamp), {
                        addSuffix: true,
                        locale: dateFnsLocale,
                      })}
                    </span>
                  </ClientOnly>

                  {search.source === "local" && (
                    <span className="text-xs text-gray-500 bg-gray-700 px-1 rounded">
                      {labels.local}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                aria-label="Remove search"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSearch(search);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentSearches;
