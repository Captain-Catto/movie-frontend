import { DATE_PRESETS, DatePreset } from "@/types/analytics.types";
import { ViewStats, MostViewedItem } from "@/types/analytics.types";
import { exportToCSV } from "@/utils/analyticsUtils";

interface AnalyticsHeaderProps {
  isLiveConnected: boolean;
  isRefreshing: boolean;
  lastRefreshed: Date | null;
  datePreset: DatePreset;
  contentType: "all" | "movie" | "tv";
  customDateRange: { startDate: string; endDate: string };
  viewStats: ViewStats[];
  mostViewedContent: MostViewedItem[];
  onRefresh: () => void;
  onDatePresetChange: (preset: DatePreset) => void;
  onContentTypeChange: (type: "all" | "movie" | "tv") => void;
  onCustomDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

export default function AnalyticsHeader({
  isLiveConnected,
  isRefreshing,
  lastRefreshed,
  datePreset,
  contentType,
  customDateRange,
  viewStats,
  mostViewedContent,
  onRefresh,
  onDatePresetChange,
  onContentTypeChange,
  onCustomDateRangeChange,
}: AnalyticsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Track views, clicks, favorites, and device/country distribution
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
              isLiveConnected
                ? "bg-green-600/80 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            title={
              isLiveConnected
                ? "Realtime updates active"
                : "Realtime updates offline"
            }
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isLiveConnected ? "bg-green-200 animate-pulse" : "bg-gray-500"
              }`}
            />
            <span>{isLiveConnected ? "Live" : "Live paused"}</span>
          </div>
          <button
            onClick={onRefresh}
            aria-label="Refresh analytics data"
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center justify-center"
            title={
              lastRefreshed
                ? `Last refreshed: ${lastRefreshed.toLocaleTimeString()}`
                : "Refresh data"
            }
          >
            <svg
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="sr-only">Refresh</span>
          </button>
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
                  onClick={() => onDatePresetChange(preset.key)}
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
                onContentTypeChange(e.target.value as "all" | "movie" | "tv")
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
                  onCustomDateRangeChange({
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
                  onCustomDateRangeChange({
                    ...customDateRange,
                    endDate: e.target.value,
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
