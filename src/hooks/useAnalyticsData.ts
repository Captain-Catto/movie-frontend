import { useState, useCallback, useEffect } from "react";
import { useAdminApi } from "./useAdminApi";
import {
  ViewStats,
  ViewSummary,
  ClickStats,
  PlayStats,
  FavoriteStats,
  PopularContent,
  MostViewedItem,
  DeviceStats,
  CountryStats,
  DateRange,
  AnalyticsData,
} from "@/types/analytics.types";

interface UseAnalyticsDataProps {
  dateRange: DateRange;
  contentType: "all" | "movie" | "tv";
}

interface UseAnalyticsDataReturn extends AnalyticsData {
  loading: boolean;
  isRefreshing: boolean;
  lastRefreshed: Date | null;
  refetch: () => Promise<void>;
}

export function useAnalyticsData({
  dateRange,
  contentType,
}: UseAnalyticsDataProps): UseAnalyticsDataReturn {
  const [viewStats, setViewStats] = useState<ViewStats[]>([]);
  const [viewSummary, setViewSummary] = useState<ViewSummary | null>(null);
  const [clickStats, setClickStats] = useState<ClickStats | null>(null);
  const [playStats, setPlayStats] = useState<PlayStats | null>(null);
  const [playSourceBreakdown, setPlaySourceBreakdown] = useState<
    Record<string, number>
  >({});
  const [favoriteStats, setFavoriteStats] = useState<FavoriteStats | null>(null);
  const [popularContent, setPopularContent] = useState<PopularContent[]>([]);
  const [mostViewedContent, setMostViewedContent] = useState<MostViewedItem[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const adminApi = useAdminApi();

  const fetchAnalytics = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;

    setLoading(true);
    setIsRefreshing(true);
    setPlaySourceBreakdown({});

    try {
      const viewParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(contentType !== "all" && { contentType }),
      });
      const mostViewedParams = new URLSearchParams({
        limit: "10",
        ...(contentType !== "all" && { contentType }),
      });
      const favoriteParams = new URLSearchParams({
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
        adminApi.get<FavoriteStats>(`/admin/analytics/favorites?${favoriteParams}`),
        adminApi.get<MostViewedItem[]>(`/admin/analytics/most-viewed?${mostViewedParams}`),
        adminApi.get<unknown>(`/admin/analytics/popular?${viewParams}`),
        adminApi.get<DeviceStats[]>(`/admin/analytics/devices?${viewParams}`),
        adminApi.get<CountryStats[]>(`/admin/analytics/countries?${viewParams}`),
      ]);

      // Process view stats
      if (viewRes.success && viewRes.data) {
        const data = viewRes.data;
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
      }

      // Process click stats
      if (clickRes.success && clickRes.data) {
        setClickStats({
          total: Number((clickRes.data as ClickStats).total ?? 0),
        });
      }

      // Process play stats
      if (playRes.success && playRes.data) {
        setPlayStats({
          total: Number((playRes.data as PlayStats).total ?? 0),
          bySource: (playRes.data as PlayStats).bySource ?? {},
        });
        setPlaySourceBreakdown((playRes.data as PlayStats).bySource ?? {});
      }

      // Process favorite stats
      if (favoriteRes.success && favoriteRes.data) {
        const favData = favoriteRes.data as FavoriteStats;
        setFavoriteStats({
          total: Number(favData.total ?? 0),
          byType: favData.byType,
          mostFavorited: favData.mostFavorited ?? [],
          trend: favData.trend ?? [],
        });
      }

      // Process most viewed
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
            posterPath:
              (record.posterPath as string | undefined) ??
              (record.poster_path as string | undefined) ??
              (record.posterUrl as string | undefined) ??
              null,
          };
        });
        setMostViewedContent(normalized);
      }

      // Process popular content
      if (popularRes.success) {
        const rawPopular = popularRes.data;
        const popularArray: unknown = Array.isArray(rawPopular)
          ? rawPopular
          : rawPopular
          ? [
              ...(((rawPopular as Record<string, unknown>).movies as unknown[]) ?? []),
              ...(((rawPopular as Record<string, unknown>).tvSeries as unknown[]) ?? []),
            ]
          : [];

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

        setPopularContent(normalizedPopular);
      }

      // Process device stats
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
          const percentage = totalDevices > 0 ? (safeCount / totalDevices) * 100 : 0;
          return {
            device: (record.device as string) ?? "Unknown",
            count: safeCount,
            percentage,
          };
        });

        setDeviceStats(normalizedDevices);
      }

      // Process country stats
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
          const percentage = totalCountries > 0 ? (safeCount / totalCountries) * 100 : 0;
          return {
            country: (record.country as string) ?? "Unknown",
            count: safeCount,
            percentage,
          };
        });

        setCountryStats(normalizedCountries);
      }

      setLastRefreshed(new Date());
    } catch (error) {
      console.error("[Analytics] Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [adminApi, dateRange, contentType]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return {
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
    refetch: fetchAnalytics,
  };
}
