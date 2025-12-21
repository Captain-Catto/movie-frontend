"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
} from "@/constants/app.constants";
import Link from "next/link";
import AnalyticsSkeleton from "@/components/ui/AnalyticsSkeleton";
import { useAdminApi } from "@/hooks/useAdminApi";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ViewStats {
  date: string;
  views: number;
}

interface PopularContent {
  tmdbId: number;
  title: string;
  contentType: "movie" | "tv";
  viewCount: number;
  clickCount: number;
  favoriteCount: number;
  posterPath?: string;
}

interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
}

interface CountryStats {
  country: string;
  count: number;
  percentage: number;
}

interface ViewSummary {
  total: number;
  byType?: {
    movies?: number;
    tvSeries?: number;
  };
}

interface ClickStats {
  total: number;
}

interface PlayStats {
  total: number;
}

interface FavoriteStats {
  total: number;
  byType?: {
    movies?: number;
    tvSeries?: number;
  };
  mostFavorited?: Array<{
    contentId: number;
    contentType: string;
    count: number;
    title?: string;
    posterPath?: string;
  }>;
  trend?: Array<{
    date: string;
    count: number;
  }>;
}

interface MostViewedItem {
  contentId: number;
  contentType: string;
  title?: string;
  viewCount: number;
}

type DatePreset = "7d" | "30d" | "90d" | "1y" | "custom";

const DATE_PRESETS = [
  { key: "7d" as DatePreset, label: "Last 7 Days" },
  { key: "30d" as DatePreset, label: "Last 30 Days" },
  { key: "90d" as DatePreset, label: "Last 90 Days" },
  { key: "1y" as DatePreset, label: "Last Year" },
  { key: "custom" as DatePreset, label: "Custom Range" },
];

const DEVICE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const CHART_COLORS = {
  primary: "#EF4444",
  secondary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
};

export default function AdminAnalyticsPage() {
  const [viewStats, setViewStats] = useState<ViewStats[]>([]);
  const [viewSummary, setViewSummary] = useState<ViewSummary | null>(null);
  const [clickStats, setClickStats] = useState<ClickStats | null>(null);
  const [playStats, setPlayStats] = useState<PlayStats | null>(null);
  const [favoriteStats, setFavoriteStats] = useState<FavoriteStats | null>(
    null
  );
  const [popularContent, setPopularContent] = useState<PopularContent[]>([]);
  const [mostViewedContent, setMostViewedContent] = useState<MostViewedItem[]>(
    []
  );
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [contentType, setContentType] = useState<"all" | "movie" | "tv">("all");
  const adminApi = useAdminApi();

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (datePreset) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
      case "1y":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "custom":
        return {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
        };
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [datePreset, customDateRange]);

  const formatNumber = (value?: number | null) => {
    const numeric =
      typeof value === "number" && Number.isFinite(value) ? value : 0;
    return numeric.toLocaleString();
  };

  const formatCompactNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const exportToCSV = useCallback(
    <T extends object>(data: T[], filename: string) => {
      if (data.length === 0) return;

      const headers = Object.keys(data[0] as object);
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) =>
              JSON.stringify((row as Record<string, unknown>)[header] ?? "")
            )
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  const fetchAnalytics = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;

    setLoading(true);
    try {
      const viewParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(contentType !== "all" && { contentType }),
      });

      const [
        viewRes,
        clickRes,
        playRes,
        favoriteRes,
        mostViewedRes,
        popularRes,
        deviceRes,
        countryRes,
      ] = await Promise.all([
        adminApi.get<{
          total: number;
          byType?: { movies?: number; tvSeries?: number };
          trend?: Array<{ date: string; views?: number; count?: number }>;
        }>(`/admin/analytics/views?${viewParams}`),
        adminApi.get<ClickStats>(`/admin/analytics/clicks?${viewParams}`),
        adminApi.get<PlayStats>(`/admin/analytics/plays?${viewParams}`),
        adminApi.get<FavoriteStats>(`/admin/analytics/favorites`),
        adminApi.get<MostViewedItem[]>(`/admin/analytics/most-viewed?limit=10`),
        adminApi.get<unknown>(`/admin/analytics/popular?${viewParams}`),
        adminApi.get<DeviceStats[]>(`/admin/analytics/devices?${viewParams}`),
        adminApi.get<CountryStats[]>(
          `/admin/analytics/countries?${viewParams}`
        ),
      ]);

      console.log("[Analytics] View response:", viewRes);
      if (viewRes.success && viewRes.data) {
        const data = viewRes.data;
        console.log("[Analytics] View data:", data);
        setViewSummary({
          total: Number(data.total ?? 0),
          byType: data.byType,
        });
        const trendArray = Array.isArray(data.trend) ? data.trend : [];
        const normalizedViewStats: ViewStats[] = trendArray.map((item) => ({
          date: (item.date as string) ?? "",
          views: Number(item.views ?? item.count ?? 0),
        }));
        setViewStats(normalizedViewStats);
        console.log("[Analytics] Normalized view stats:", normalizedViewStats);
      } else {
        console.warn("[Analytics] View response failed or no data:", viewRes);
      }

      if (clickRes.success && clickRes.data) {
        setClickStats({
          total: Number((clickRes.data as ClickStats).total ?? 0),
        });
      }

      if (playRes.success && playRes.data) {
        setPlayStats({
          total: Number((playRes.data as PlayStats).total ?? 0),
        });
      }

      if (favoriteRes.success && favoriteRes.data) {
        const favData = favoriteRes.data as FavoriteStats;
        setFavoriteStats({
          total: Number(favData.total ?? 0),
          byType: favData.byType,
          mostFavorited: favData.mostFavorited ?? [],
          trend: favData.trend ?? [],
        });
      }

      if (mostViewedRes.success) {
        const rawMostViewed = Array.isArray(mostViewedRes.data)
          ? mostViewedRes.data
          : [];
        const normalized: MostViewedItem[] = rawMostViewed.map((item) => {
          const record = item as unknown as Record<string, unknown>;
          return {
            contentId: Number(record.contentId ?? record.id ?? 0),
            contentType: (record.contentType as string) ?? "movie",
            title: (record.title as string) ?? "Unknown title",
            viewCount: Number(record.viewCount ?? record.count ?? 0),
          };
        });
        setMostViewedContent(normalized);
      }

      console.log("[Analytics] Popular response:", popularRes);
      if (popularRes.success) {
        const rawPopular = popularRes.data;
        console.log("[Analytics] Raw popular data:", rawPopular);
        const popularArray: unknown = Array.isArray(rawPopular)
          ? rawPopular
          : rawPopular
          ? [
              ...(((rawPopular as Record<string, unknown>)
                .movies as unknown[]) ?? []),
              ...(((rawPopular as Record<string, unknown>)
                .tvSeries as unknown[]) ?? []),
            ]
          : [];

        console.log(
          "[Analytics] Popular array after normalization:",
          popularArray
        );
        const normalizedPopular: PopularContent[] = Array.isArray(popularArray)
          ? popularArray.map((item) => {
              const record = item as Record<string, unknown>;
              const tmdbId = Number(record.tmdbId ?? record.id ?? 0);
              const typeValue = (record.contentType ?? record.type) as
                | "movie"
                | "tv"
                | string
                | undefined;
              const poster =
                (record.posterPath as string | undefined) ??
                (record.posterUrl as string | undefined);
              return {
                tmdbId,
                title: (record.title as string) ?? "Unknown title",
                contentType: typeValue === "tv" ? "tv" : "movie",
                viewCount: Number(record.viewCount ?? 0),
                clickCount: Number(record.clickCount ?? 0),
                favoriteCount: Number(record.favoriteCount ?? 0),
                posterPath: poster ?? undefined,
              };
            })
          : [];

        console.log(
          "[Analytics] Final normalized popular content:",
          normalizedPopular
        );
        setPopularContent(normalizedPopular);
      } else {
        console.warn("[Analytics] Popular response failed:", popularRes);
      }

      if (deviceRes.success) {
        const rawDevices: unknown[] = Array.isArray(deviceRes.data)
          ? deviceRes.data
          : [];
        const totalDevices = rawDevices.reduce<number>((sum, item) => {
          const count = Number((item as Record<string, unknown>).count ?? 0);
          return sum + (Number.isFinite(count) ? count : 0);
        }, 0);

        const normalizedDevices: DeviceStats[] = rawDevices.map((item) => {
          const record = item as Record<string, unknown>;
          const count = Number(record.count ?? 0);
          const safeCount = Number.isFinite(count) ? count : 0;
          const percentage =
            totalDevices > 0 ? (safeCount / totalDevices) * 100 : 0;
          return {
            device: (record.device as string) ?? "Unknown",
            count: safeCount,
            percentage,
          };
        });

        setDeviceStats(normalizedDevices);
      }

      if (countryRes.success) {
        const rawCountries: unknown[] = Array.isArray(countryRes.data)
          ? countryRes.data
          : [];
        const totalCountries = rawCountries.reduce<number>((sum, item) => {
          const count = Number((item as Record<string, unknown>).count ?? 0);
          return sum + (Number.isFinite(count) ? count : 0);
        }, 0);

        const normalizedCountries: CountryStats[] = rawCountries.map((item) => {
          const record = item as Record<string, unknown>;
          const count = Number(record.count ?? 0);
          const safeCount = Number.isFinite(count) ? count : 0;
          const percentage =
            totalCountries > 0 ? (safeCount / totalCountries) * 100 : 0;
          return {
            country: (record.country as string) ?? "Unknown",
            count: safeCount,
            percentage,
          };
        });

        setCountryStats(normalizedCountries);
      }
    } catch (error) {
      console.error("[Analytics] Error fetching analytics:", error);
      console.error("[Analytics] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      setViewStats([]);
      setPopularContent([]);
      setMostViewedContent([]);
      setDeviceStats([]);
      setCountryStats([]);
      setViewSummary(null);
      setClickStats(null);
      setPlayStats(null);
      setFavoriteStats(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, contentType, adminApi]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totalViews = viewSummary?.total ?? 0;
  const totalClicks = clickStats?.total ?? 0;
  const totalPlays = playStats?.total ?? 0;
  const totalFavorites = favoriteStats?.total ?? 0;
  const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const favRate = totalViews > 0 ? (totalFavorites / totalViews) * 100 : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <AnalyticsSkeleton />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Track views, clicks, favorites, and device/country distribution
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportToCSV(viewStats, "analytics-views")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export Views
            </button>
            <button
              onClick={() =>
                exportToCSV(mostViewedContent, "analytics-most-viewed")
              }
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4h16v4H4zM4 12h16v8H4z"
                />
              </svg>
              Export Top
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Date Presets */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Period
              </label>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => setDatePreset(preset.key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      datePreset === preset.key
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) =>
                  setContentType(e.target.value as "all" | "movie" | "tv")
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Content</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range (shown when custom is selected) */}
          {datePreset === "custom" && (
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      endDate: e.target.value,
                    })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Engagement Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Views</p>
                <p className="text-3xl font-bold mt-2">
                  {formatCompactNumber(totalViews)}
                </p>
                <p className="text-xs text-red-100/80 mt-1">
                  Events tracked (VIEW)
                </p>
              </div>
              <div className="bg-red-500 bg-opacity-30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Clicks
                </p>
                <p className="text-3xl font-bold mt-2">
                  {formatCompactNumber(totalClicks)}
                </p>
                <p className="text-xs text-blue-100/80 mt-1">
                  Events tracked (CLICK)
                </p>
              </div>
              <div className="bg-blue-500 bg-opacity-30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Total Plays
                </p>
                <p className="text-3xl font-bold mt-2">
                  {formatCompactNumber(totalPlays)}
                </p>
                <p className="text-xs text-purple-100/80 mt-1">
                  Events tracked (PLAY)
                </p>
              </div>
              <div className="bg-purple-500 bg-opacity-30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">CTR</p>
                <p className="text-3xl font-bold mt-2">{ctr.toFixed(1)}%</p>
                <p className="text-xs text-indigo-100/80 mt-1">
                  Clicks / Views
                </p>
              </div>
              <div className="bg-indigo-500 bg-opacity-30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18M9 6l2-2 2 2m-4 12l2 2 2-2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Favorites</p>
                <p className="text-3xl font-bold mt-2">
                  {formatCompactNumber(totalFavorites)}
                </p>
                <p className="text-xs text-green-100/80 mt-1">Saved items</p>
              </div>
              <div className="bg-green-500 bg-opacity-30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">
                  Favorite Rate
                </p>
                <p className="text-3xl font-bold mt-2">{favRate.toFixed(1)}%</p>
                <p className="text-xs text-amber-100/80 mt-1">
                  Favorites / Views
                </p>
              </div>
              <div className="bg-amber-500 bg-opacity-30 p-3 rounded-full">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v8m-4-4h8M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Views Over Time Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-2">
              Views Over Time
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Trend is limited to the last 30 days (backend constraint)
            </p>
            {viewStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tickFormatter={(value: string | number) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#F3F4F6",
                    }}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.primary }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No data available for the selected period
              </div>
            )}
          </div>

          {/* Favorites Over Time */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-2">
              Favorites Over Time
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Trend is limited to the last 30 days (backend constraint)
            </p>
            {favoriteStats?.trend && favoriteStats.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={favoriteStats.trend.map((item) => ({
                    date: item.date,
                    favorites: Number(item.count ?? 0),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tickFormatter={(value: string | number) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#F3F4F6",
                    }}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="favorites"
                    stroke={CHART_COLORS.success}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.success }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No favorites data available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Popular Content */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Top Content (viewCount)
              </h2>
              <button
                onClick={() => exportToCSV(popularContent, "popular-content")}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Export
              </button>
            </div>
            {popularContent.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {popularContent.slice(0, 10).map((content, index) => (
                  <div
                    key={content.tmdbId}
                    className="flex items-center gap-3 p-3 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors"
                  >
                    <span className="text-2xl font-bold text-gray-500 w-8">
                      #{index + 1}
                    </span>
                    {content.posterPath && (
                      <div className="relative w-12 h-18 flex-shrink-0">
                        <Image
                          src={
                            content.posterPath
                              ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${content.posterPath}`
                              : FALLBACK_POSTER
                          }
                          alt={content.title}
                          fill
                          className="object-cover rounded"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {content.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                        <span className="capitalize">
                          {content.contentType}
                        </span>
                        <span>{formatNumber(content.viewCount)} views</span>
                        <span>
                          {formatNumber(content.favoriteCount)} favorites
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400">
                No popular content data available
              </div>
            )}
          </div>

          {/* Most viewed events */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Most Viewed (events)
              </h2>
              <button
                onClick={() =>
                  exportToCSV(mostViewedContent, "most-viewed-events")
                }
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Export
              </button>
            </div>
            {mostViewedContent.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {mostViewedContent.map((item, index) => (
                  <div
                    key={`${item.contentType}-${item.contentId}-${index}`}
                    className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded-lg p-3 hover:bg-opacity-70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl font-bold text-gray-500 w-8">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">
                          {item.title ?? "Unknown title"}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {item.contentType}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-200 font-semibold">
                      {formatNumber(item.viewCount)} views
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400">
                No view events data available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Most Favorited */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Most Favorited</h2>
              <button
                onClick={() =>
                  exportToCSV(
                    favoriteStats?.mostFavorited ?? [],
                    "most-favorited"
                  )
                }
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Export
              </button>
            </div>
            {favoriteStats?.mostFavorited &&
            favoriteStats.mostFavorited.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {favoriteStats.mostFavorited.slice(0, 15).map((item, index) => (
                  <Link
                    key={`${item.contentType}-${item.contentId}-${index}`}
                    href={`/${item.contentType === 'tv_series' ? 'tv' : 'movie'}/${item.contentId}`}
                    className="flex items-center gap-3 p-3 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-colors cursor-pointer"
                  >
                    <span className="text-2xl font-bold text-gray-500 w-8">
                      #{index + 1}
                    </span>
                    {item.posterPath && (
                      <div className="relative w-12 h-18 flex-shrink-0">
                        <Image
                          src={`${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${item.posterPath}`}
                          alt={item.title || "Movie poster"}
                          fill
                          className="object-cover rounded"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {item.title || `${item.contentType} #${item.contentId}`}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {item.contentType}
                      </p>
                    </div>
                    <span className="text-sm text-gray-200 font-semibold">
                      {formatNumber(item.count)} favorites
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400">
                No favorite data available
              </div>
            )}
          </div>

          {/* Device Distribution */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">
              Device Distribution
            </h2>
            {deviceStats.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <ResponsiveContainer width="50%" height={300}>
                  <PieChart>
                    <Pie
                      data={
                        deviceStats as unknown as Array<Record<string, unknown>>
                      }
                      dataKey="count"
                      nameKey="device"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(props: { index: number }) => {
                        const entry = deviceStats[props.index];
                        return `${entry.device}: ${entry.percentage.toFixed(
                          1
                        )}%`;
                      }}
                    >
                      {deviceStats.map((entry: DeviceStats, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DEVICE_COLORS[index % DEVICE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "0.5rem",
                        color: "#F3F4F6",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3 w-full">
                  {deviceStats.map((device, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor:
                              DEVICE_COLORS[index % DEVICE_COLORS.length],
                          }}
                        />
                        <span className="text-white font-medium">
                          {device.device}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        {formatNumber(device.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No device data available
              </div>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Top Countries</h2>
              <button
                onClick={() => exportToCSV(countryStats, "country-stats")}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Export
              </button>
            </div>
            {countryStats.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {countryStats.slice(0, 15).map((country, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-gray-500 font-medium w-6">
                        {index + 1}
                      </span>
                      <span className="text-white font-medium">
                        {country.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(country.percentage, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-20 text-right">
                        {formatNumber(country.count)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400">
                No geographic data available
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
