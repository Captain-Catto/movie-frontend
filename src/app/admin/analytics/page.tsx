"use client";

import { useState } from "react";
import { useAdminAnalyticsContext } from "@/context/AdminAnalyticsContext";
import { useAnalyticsDateRange } from "@/hooks/useAnalyticsDateRange";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsStatsCards from "@/components/analytics/AnalyticsStatsCards";
import AnalyticsPlaySourceBreakdown from "@/components/analytics/AnalyticsPlaySourceBreakdown";
import dynamic from "next/dynamic";
const AnalyticsViewChart = dynamic(() => import("@/components/analytics/AnalyticsViewChart"), { ssr: false });
const AnalyticsFavoritesChart = dynamic(() => import("@/components/analytics/AnalyticsFavoritesChart"), { ssr: false });
const AnalyticsDeviceStats = dynamic(() => import("@/components/analytics/AnalyticsDeviceStats"), { ssr: false });
import AnalyticsContentList from "@/components/analytics/AnalyticsContentList";
import AnalyticsCountryStats from "@/components/analytics/AnalyticsCountryStats";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages } from "@/lib/ui-messages";

export default function AdminAnalyticsPage() {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const [contentType, setContentType] = useState<"all" | "movie" | "tv">("all");

  const {
    datePreset,
    setDatePreset,
    customDateRange,
    setCustomDateRange,
    dateRange,
  } = useAnalyticsDateRange();

  const {
    viewStats,
    viewSummary,
    clickStats,
    playStats,
    playSourceBreakdown,
    favoriteStats,
    popularContent,
    mostViewedContent,
    deviceStats,
    countryStats,
    loading,
    isRefreshing,
    lastRefreshed,
    refetch,
  } = useAnalyticsData({ dateRange, contentType });

  const { snapshot: liveSnapshot, isConnected: isLiveConnected, lastUpdateAt } =
    useAdminAnalyticsContext();

  // Calculate stats
  const totalViews = liveSnapshot?.views ?? viewSummary?.total ?? 0;
  const totalClicks = liveSnapshot?.clicks ?? clickStats?.total ?? 0;
  const totalPlays = liveSnapshot?.plays ?? playStats?.total ?? 0;
  const totalFavorites = liveSnapshot?.favorites ?? favoriteStats?.total ?? 0;
  const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const favRate = totalViews > 0 ? (totalFavorites / totalViews) * 100 : 0;

  // Transform data for content lists
  const popularContentData = popularContent.map((item) => ({
    id: item.tmdbId,
    title: item.title,
    contentType: item.contentType,
    posterPath: item.posterPath,
    viewCount: item.viewCount,
    favoriteCount: item.favoriteCount,
  }));

  const mostViewedData = mostViewedContent.map((item) => ({
    id: item.contentId,
    title: item.title || "Unknown title",
    contentType: item.contentType,
    posterPath: item.posterPath,
    count: item.viewCount,
  }));

  const mostFavoritedData =
    favoriteStats?.mostFavorited?.map((item) => ({
      id: item.contentId,
      title: item.title || `${item.contentType} #${item.contentId}`,
      contentType: item.contentType,
      posterPath: item.posterPath,
      count: item.count,
    })) ?? [];

  const headerLastRefreshed = lastUpdateAt || lastRefreshed;

  return (
    <div className="space-y-8">
      {/* Header with filters */}
      <AnalyticsHeader
        isLiveConnected={isLiveConnected}
        isRefreshing={isRefreshing}
        lastRefreshed={headerLastRefreshed}
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

      {/* Stats Cards */}
      <AnalyticsStatsCards
        totalViews={totalViews}
        totalClicks={totalClicks}
        totalPlays={totalPlays}
        totalFavorites={totalFavorites}
        ctr={ctr}
        favRate={favRate}
        loading={loading}
      />

      {/* Play Source Breakdown */}
      <AnalyticsPlaySourceBreakdown
        playSourceBreakdown={playSourceBreakdown}
        loading={loading}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsViewChart viewStats={viewStats} />
        <AnalyticsFavoritesChart favoriteStats={favoriteStats} />
      </div>

      {/* Content Lists Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsContentList
          title={labels.analyticsTopContent}
          data={popularContentData.slice(0, 10)}
          exportFilename="popular-content"
          emptyMessage={labels.analyticsNoPopularData}
        />
        <AnalyticsContentList
          title={labels.analyticsMostViewedEvents}
          data={mostViewedData}
          exportFilename="most-viewed-events"
          emptyMessage={labels.analyticsNoViewEventsData}
        />
      </div>

      {/* Content Lists Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsContentList
          title={labels.analyticsMostFavorited}
          data={mostFavoritedData.slice(0, 15)}
          exportFilename="most-favorited"
          emptyMessage={labels.analyticsNoFavoriteData}
        />
        <AnalyticsDeviceStats deviceStats={deviceStats} />
      </div>

      {/* Country Stats */}
      <AnalyticsCountryStats countryStats={countryStats} />
    </div>
  );
}

