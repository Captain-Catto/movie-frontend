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
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
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
          <h3 className="text-white font-medium flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{labels.recentSearchesTitle}</span>
          </h3>

          {searches.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{labels.clearAll}</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {searches.map((search, index) => (
            <div
              key={search.id || `${search.query}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group cursor-pointer"
              onClick={() => onSearchClick(search)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
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

                <div className="flex items-center space-x-2 mt-1">
                  <ClientOnly
                    fallback={
                      <span className="text-xs text-gray-400">
                        {labels.recently}
                      </span>
                    }
                  >
                    <span className="text-xs text-gray-400">
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
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSearch(search);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentSearches;
