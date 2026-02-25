"use client";

import MovieGrid from "@/components/movie/MovieGrid";
import { useTrendingSuggestions } from "@/hooks/components/useTrendingSuggestions";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTrendingSuggestionsUiMessages } from "@/lib/ui-messages";

interface TrendingSuggestionsProps {
  type: "movie" | "tv" | "all";
  title?: string;
}

export default function TrendingSuggestions({
  type,
  title,
}: TrendingSuggestionsProps) {
  const { language } = useLanguage();
  const labels = getTrendingSuggestionsUiMessages(language);
  const { items, loading } = useTrendingSuggestions({ type, limit: 6 });

  if (!loading && items.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-t border-gray-800 pt-12">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">
          {title || labels.popularRightNow}
        </h3>
        <MovieGrid
          movies={items}
          showFilters={false}
          maxRows={1}
          containerPadding={false}
          loading={loading}
          skeletonCount={6}
        />
      </div>
    </div>
  );
}
