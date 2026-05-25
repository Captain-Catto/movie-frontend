"use client";

import { useState } from "react";
import { useAdminAnalyticsContext } from "@/context/AdminAnalyticsContext";
import { useAnalyticsDateRange } from "@/hooks/useAnalyticsDateRange";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
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

  const handleExportAll = () => {
    let csvContent = "";

    // Helper to format section header
    const addSectionHeader = (title: string) => {
      csvContent += `\n"=== ${title.toUpperCase()} ==="\n`;
    };

    // Overview section
    addSectionHeader(language.startsWith("vi") ? "Báo Cáo Tổng Quan" : "Overview Report");
    csvContent += `"Chỉ số (Metric)","Giá trị (Value)"\n`;
    csvContent += `"Tổng lượt xem (Total Views)",${totalViews}\n`;
    csvContent += `"Tổng lượt click (Total Clicks)",${totalClicks}\n`;
    csvContent += `"Tổng lượt phát (Total Plays)",${totalPlays}\n`;
    csvContent += `"Tổng lượt yêu thích (Total Favorites)",${totalFavorites}\n`;
    csvContent += `"Tỷ lệ CTR (Click-Through Rate)","${ctr.toFixed(2)}%"\n`;
    csvContent += `"Tỷ lệ yêu thích (Favorite Rate)","${favRate.toFixed(2)}%"\n`;

    // Device section
    if (deviceStats && deviceStats.length > 0) {
      addSectionHeader(language.startsWith("vi") ? "Phân Phối Thiết Bị" : "Device Distribution");
      csvContent += `"Thiết bị (Device)","Số lượng (Count)","Tỷ lệ (Percentage)"\n`;
      deviceStats.forEach(d => {
        csvContent += `"${d.device}",${d.count},"${d.percentage.toFixed(2)}%"\n`;
      });
    }

    // Country section
    if (countryStats && countryStats.length > 0) {
      addSectionHeader(language.startsWith("vi") ? "Quốc Gia Hàng Đầu" : "Top Countries");
      csvContent += `"Quốc gia (Country)","Số lượng (Count)","Tỷ lệ (Percentage)"\n`;
      countryStats.forEach(c => {
        csvContent += `"${c.country}",${c.count},"${c.percentage.toFixed(2)}%"\n`;
      });
    }

    // Top Content Section
    if (popularContent && popularContent.length > 0) {
      addSectionHeader(language.startsWith("vi") ? "Nội Dung Nổi Bật (Top Content)" : "Top Content");
      csvContent += `"TMDB ID","Tiêu đề (Title)","Loại (Type)","Lượt xem (Views)","Lượt clicks","Yêu thích (Favorites)"\n`;
      popularContent.forEach(item => {
        csvContent += `${item.tmdbId},${JSON.stringify(item.title)},"${item.contentType}",${item.viewCount},${item.clickCount},${item.favoriteCount}\n`;
      });
    }

    // Most Viewed Events
    if (mostViewedContent && mostViewedContent.length > 0) {
      addSectionHeader(language.startsWith("vi") ? "Sự Kiện Xem Nhiều Nhất (Most Viewed)" : "Most Viewed Events");
      csvContent += `"Content ID","Tiêu đề (Title)","Loại (Type)","Lượt xem (Views)"\n`;
      mostViewedContent.forEach(item => {
        csvContent += `"${item.contentId}",${JSON.stringify(item.title)},"${item.contentType}",${item.viewCount}\n`;
      });
    }

    // Most Favorited
    if (favoriteStats?.mostFavorited && favoriteStats.mostFavorited.length > 0) {
      addSectionHeader(language.startsWith("vi") ? "Yêu Thích Nhiều Nhất (Most Favorited)" : "Most Favorited");
      csvContent += `"Content ID","Tiêu đề (Title)","Loại (Type)","Số lượt thích (Count)"\n`;
      favoriteStats.mostFavorited.forEach(item => {
        csvContent += `"${item.contentId}",${JSON.stringify(item.title)},"${item.contentType}",${item.count}\n`;
      });
    }

    // Play Source Breakdown
    if (playSourceBreakdown && Object.keys(playSourceBreakdown).length > 0) {
      addSectionHeader(language.startsWith("vi") ? "Nguồn Phát Video" : "Play Source Breakdown");
      csvContent += `"Nguồn (Source)","Số lượng (Plays)"\n`;
      Object.entries(playSourceBreakdown).forEach(([source, count]) => {
        csvContent += `"${source}",${count}\n`;
      });
    }

    // Download CSV blob with UTF-8 BOM to resolve Vietnamese characters in MS Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `analytics-report-full_${dateRange.startDate}_to_${dateRange.endDate}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        onExportAll={handleExportAll}
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

