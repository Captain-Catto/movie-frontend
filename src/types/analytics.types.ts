export interface ViewStats {
  date: string;
  views: number;
}

export interface PopularContent {
  tmdbId: number;
  title: string;
  contentType: "movie" | "tv";
  viewCount: number;
  clickCount: number;
  favoriteCount: number;
  posterPath?: string;
}

export interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
}

export interface CountryStats {
  country: string;
  count: number;
  percentage: number;
}

export interface ViewSummary {
  total: number;
  byType?: {
    movies?: number;
    tvSeries?: number;
  };
}

export interface ClickStats {
  total: number;
}

export interface PlayStats {
  total: number;
  bySource?: Record<string, number>;
}

export interface FavoriteStats {
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

export interface MostViewedItem {
  contentId: number;
  contentType: string;
  title?: string;
  viewCount: number;
  posterPath?: string | null;
}

export type DatePreset = "7d" | "30d" | "90d" | "1y" | "custom";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilters {
  datePreset: DatePreset;
  contentType: "all" | "movie" | "tv";
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface AnalyticsData {
  viewStats: ViewStats[];
  viewSummary: ViewSummary | null;
  clickStats: ClickStats | null;
  playStats: PlayStats | null;
  playSourceBreakdown: Record<string, number>;
  favoriteStats: FavoriteStats | null;
  popularContent: PopularContent[];
  mostViewedContent: MostViewedItem[];
  deviceStats: DeviceStats[];
  countryStats: CountryStats[];
}

export const DATE_PRESETS = [
  { key: "7d" as DatePreset, label: "Last 7 Days" },
  { key: "30d" as DatePreset, label: "Last 30 Days" },
  { key: "90d" as DatePreset, label: "Last 90 Days" },
  { key: "1y" as DatePreset, label: "Last Year" },
  { key: "custom" as DatePreset, label: "Custom Range" },
];

export const DEVICE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export const CHART_COLORS = {
  primary: "#EF4444",
  secondary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
};
