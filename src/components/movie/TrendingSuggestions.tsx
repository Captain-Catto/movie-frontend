"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import MovieGrid from "@/components/movie/MovieGrid";
import { mapMoviesToFrontend } from "@/utils/movieMapper";
import { mapTVSeriesToFrontend } from "@/utils/tvMapper";
import { mapTrendingDataToFrontend } from "@/utils/trendingMapper";
import type { MovieCardData } from "@/types/movie";

interface TrendingSuggestionsProps {
  type: "movie" | "tv" | "all";
  title?: string;
}

export default function TrendingSuggestions({
  type,
  title,
}: TrendingSuggestionsProps) {
  const [items, setItems] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        let data: MovieCardData[] = [];

        if (type === "movie") {
          const res = await apiService.getPopularMovies({ page: 1, limit: 6 });
          if (res.success && res.data) {
            data = mapMoviesToFrontend(res.data);
          }
        } else if (type === "tv") {
          const res = await apiService.getPopularTVSeries({ page: 1, limit: 6 });
          if (res.success && res.data) {
            // Helper to handle nested data structure if needed, consistent with TVSeriesSections
            const rawData =
              Array.isArray(res.data) 
                ? res.data 
                : (res.data as { data: unknown[] })?.data && Array.isArray((res.data as { data: unknown[] }).data)
                ? (res.data as { data: unknown[] }).data
                : [];
                
            data = rawData.map((tv: unknown) => mapTVSeriesToFrontend(tv as Record<string, unknown>));
          }
        } else {
          // "all" - use trending
          const res = await apiService.getTrending();
          if (res.success && res.data) {
            data = mapTrendingDataToFrontend(res.data.slice(0, 6));
          }
        }

        setItems(data.slice(0, 6)); // Ensure max 6 items
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [type]);

  if (!loading && items.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div className="border-t border-gray-800 pt-12">
        <h3 className="text-2xl font-bold text-white mb-8 text-center">
          {title || "Popular Right Now"}
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
