"use client";

import { useState } from "react";
import { useAdminAnalyticsSocket } from "@/hooks/useAdminAnalyticsSocket";
import { useAnalyticsDateRange } from "@/hooks/useAnalyticsDateRange";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsStatsCards from "@/components/analytics/AnalyticsStatsCards";

export default function AdminAnalyticsPageRefactored() {
  const [contentType, setContentType] = useState<"all" | "movie" | "tv">("all");

  const {
    datePreset,
    setDatePreset,
    customDateRange,
    setCustomDateRange,
    dateRange,
  } = useAnalyticsDateRange();

  const {
    viewSummary,
    clickStats,
    playStats,
    favoriteStats,
    viewStats,
    mostViewedContent,
    loading,
    isRefreshing,
    lastRefreshed,
    refetch,
  } = useAnalyticsData({ dateRange, contentType });

  const {
    isConnected: isLiveConnected,
  } = useAdminAnalyticsSocket();

  // Calculate stats
  const totalViews = viewSummary?.total ?? 0;
  const totalClicks = clickStats?.total ?? 0;
  const totalPlays = playStats?.total ?? 0;
  const totalFavorites = favoriteStats?.total ?? 0;
  const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const favRate = totalViews > 0 ? (totalFavorites / totalViews) * 100 : 0;

  return (
    <div className="space-y-8">
      <AnalyticsHeader
        isLiveConnected={isLiveConnected}
        isRefreshing={isRefreshing}
        lastRefreshed={lastRefreshed}
        datePreset={datePreset}
        contentType={contentType}
        customDateRange={customDateRange}
        viewStats={viewStats}
        mostViewedContent={mostViewedContent}
        onRefresh={refetch}
        onDatePresetChange={setDatePreset}
        onContentTypeChange={setContentType}
        onCustomDateRangeChange={setCustomDateRange}
      />

      <AnalyticsStatsCards
        totalViews={totalViews}
        totalClicks={totalClicks}
        totalPlays={totalPlays}
        totalFavorites={totalFavorites}
        ctr={ctr}
        favRate={favRate}
        loading={loading}
      />

      {/* TODO: Add more sections - charts, popular content, etc. */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">
          🚧 Additional analytics sections (charts, popular content, device stats, etc.)
          can be refactored into separate components following the same pattern.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Current page structure: Header (120 lines) + StatsCards (90 lines) +
          Data Hook (300 lines) = Much cleaner than 1240 lines monolith!
        </p>
      </div>
    </div>
  );
}
