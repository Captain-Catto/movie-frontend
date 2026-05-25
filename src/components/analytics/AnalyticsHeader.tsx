import { DATE_PRESETS, DatePreset } from "@/types/analytics.types";
import { ViewStats, MostViewedItem } from "@/types/analytics.types";
import { exportToCSV } from "@/utils/analyticsUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages } from "@/lib/ui-messages";

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

const getPresetLabel = (key: string, isVi: boolean) => {
  switch (key) {
    case "7d": return isVi ? "7 ngày qua" : "Last 7 Days";
    case "30d": return isVi ? "30 ngày qua" : "Last 30 Days";
    case "90d": return isVi ? "90 ngày qua" : "Last 90 Days";
    case "1y": return isVi ? "1 năm qua" : "Last Year";
    case "custom": return isVi ? "Tự chọn" : "Custom";
    default: return key;
  }
};

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
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const isVi = language.startsWith("vi");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">{labels.analyticsHeaderTitle}</h1>
          <p className="text-gray-400 mt-1">
            {labels.analyticsHeaderDesc}
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
                ? (isVi ? "Kết nối trực tiếp đang hoạt động" : "Realtime updates active")
                : (isVi ? "Kết nối trực tiếp tạm ngưng" : "Realtime updates offline")
            }
          >
            <span
              className={`size-2.5 rounded-full ${
                isLiveConnected ? "bg-green-200 animate-pulse" : "bg-gray-500"
              }`}
            />
            <span>{isLiveConnected ? (isVi ? "Trực tiếp" : "Live") : (isVi ? "Tạm dừng" : "Live paused")}</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh analytics data"
            className="size-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center justify-center cursor-pointer"
            title={
              lastRefreshed
                ? `${isVi ? "Tải lại lúc" : "Last refreshed"}: ${lastRefreshed.toLocaleTimeString()}`
                : (isVi ? "Tải lại dữ liệu" : "Refresh data")
            }
          >
            <svg
              className={`size-5 ${isRefreshing ? "animate-spin" : ""}`}
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
            type="button"
            onClick={() => exportToCSV(viewStats, "analytics-views")}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg
              className="size-5"
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
            {isVi ? "Xuất Lượt Xem" : "Export Views"}
          </button>
          <button
            type="button"
            onClick={() =>
              exportToCSV(mostViewedContent, "analytics-most-viewed")
            }
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg
              className="size-5"
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
            {isVi ? "Xuất Top Phim" : "Export Top"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Date Presets */}
          <fieldset className="flex-1">
            <legend className="block text-sm font-medium text-gray-300 mb-2">
              {isVi ? "Khoảng thời gian" : "Time Period"}
            </legend>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => onDatePresetChange(preset.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    datePreset === preset.key
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {getPresetLabel(preset.key, isVi)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Content Type Filter */}
          <div className="w-full lg:w-48">
            <label htmlFor="analytics-content-type" className="block text-sm font-medium text-gray-300 mb-2">
              {isVi ? "Loại nội dung" : "Content Type"}
            </label>
            <select
              id="analytics-content-type"
              value={contentType}
              onChange={(e) =>
                onContentTypeChange(e.target.value as "all" | "movie" | "tv")
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">{isVi ? "Tất cả nội dung" : "All Content"}</option>
              <option value="movie">{isVi ? "Phim lẻ" : "Movies"}</option>
              <option value="tv">{isVi ? "Phim bộ" : "TV Shows"}</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range (shown when custom is selected) */}
        {datePreset === "custom" && (
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <label htmlFor="analytics-start-date" className="block text-sm font-medium text-gray-300 mb-2">
                {isVi ? "Ngày bắt đầu" : "Start Date"}
              </label>
              <input
                id="analytics-start-date"
                type="date"
                aria-label="Analytics start date"
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
              <label htmlFor="analytics-end-date" className="block text-sm font-medium text-gray-300 mb-2">
                {isVi ? "Ngày kết thúc" : "End Date"}
              </label>
              <input
                id="analytics-end-date"
                type="date"
                aria-label="Analytics end date"
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

