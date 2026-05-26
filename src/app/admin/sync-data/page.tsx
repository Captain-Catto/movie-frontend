"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import StatsCard from "@/components/admin/StatsCard";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToast } from "@/hooks/useToast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminUiMessages, type AdminUiMessages } from "@/lib/ui-messages";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalMovies: number;
  totalTVSeries: number;
  totalUsers: number;
  totalContent: number;
  todaySignups: number;
  monthlyGrowth: number;
  lastSyncDate: string | null;
  syncStatus: string;
}

interface SyncSettings {
  id: number;
  movieCatalogLimit?: number;
  tvCatalogLimit?: number;
  trendingCatalogLimit?: number;
  peopleCacheLimit?: number;
  recommendationCacheLimit?: number;
  updatedAt?: string;
}

type SyncTarget =
  | "all"
  | "movies"
  | "tv"
  | "today"
  | "popular"
  | "trending";

const SYNC_OPTIONS: Array<{ key: SyncTarget; label: string; description: string }> =
  [
    {
      key: "all",
      label: "Sync All",
      description: "Full import: movies, TV series, trending content.",
    },
    {
      key: "movies",
      label: "Sync Movies",
      description: "Update movie catalog only.",
    },
    {
      key: "tv",
      label: "Sync TV Series",
      description: "Update TV series catalog only.",
    },
    {
      key: "popular",
      label: "Sync Popular Content",
      description: "Refresh popular movies, TV series, and trending lists.",
    },
    {
      key: "trending",
      label: "Sync Trending Only",
      description: "Refresh the homepage hero and trending page cache.",
    },
    {
      key: "today",
      label: "Latest Exports",
      description: "Pull the most recent TMDB daily exports.",
    },
  ];

const getSyncOptionDetails = (key: SyncTarget, labels: AdminUiMessages) => {
  switch (key) {
    case "all":
      return { label: labels.syncOptionAll, description: labels.syncOptionAllDesc };
    case "movies":
      return { label: labels.syncOptionMovies, description: labels.syncOptionMoviesDesc };
    case "tv":
      return { label: labels.syncOptionTv, description: labels.syncOptionTvDesc };
    case "popular":
      return { label: labels.syncOptionPopular, description: labels.syncOptionPopularDesc };
    case "trending":
      return { label: labels.syncOptionTrending, description: labels.syncOptionTrendingDesc };
    case "today":
      return { label: labels.syncOptionToday, description: labels.syncOptionTodayDesc };
  }
};

function SyncPageHeader() {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);

  return (
    <header>
      <h1 className="text-3xl font-semibold text-white">{labels.syncDataHeaderTitle}</h1>
      <p className="text-gray-400 mt-2 max-w-2xl">
        {labels.syncDataHeaderDesc}
      </p>
    </header>
  );
}

function SyncStatsSection({
  stats,
  formattedLastSync,
}: {
  stats: DashboardStats | null;
  formattedLastSync: string;
}) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title={labels.syncStatsMovies}
        value={stats?.totalMovies ?? 0}
        color="bg-blue-600"
        icon={
          <svg className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14z"
            />
          </svg>
        }
      />
      <StatsCard
        title={labels.syncStatsTv}
        value={stats?.totalTVSeries ?? 0}
        color="bg-purple-600"
        icon={
          <svg className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />
      <StatsCard
        title={labels.syncStatsLastSync}
        value={formattedLastSync}
        color="bg-amber-600"
        icon={
          <svg className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <StatsCard
        title={labels.syncStatsStatus}
        value={stats?.syncStatus ?? "unknown"}
        color="bg-slate-600"
        icon={
          <svg className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2h2M12 3l4 4m-4-4L8 7m4-4v13"
            />
          </svg>
        }
      />
    </section>
  );
}

function ManualSyncSection({
  customDate,
  syncing,
  isViewer,
  onCustomDateChange,
  onSync,
}: {
  customDate: string;
  syncing: SyncTarget | null;
  isViewer: boolean;
  onCustomDateChange: (value: string) => void;
  onSync: (target: SyncTarget) => void;
}) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const { showWarning } = useToast();

  return (
    <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {language.startsWith("vi") ? "Điều khiển đồng bộ thủ công" : "Manual Sync Controls"}
          </h2>
          <p className="text-gray-400 mt-1 max-w-xl">
            {language.startsWith("vi")
              ? "Chọn tệp dữ liệu bạn muốn làm mới. Bạn có thể chọn ngày xuất dữ liệu TMDB trước đó (YYYY-MM-DD). Để trống để sử dụng ngày hôm nay."
              : "Choose the dataset you want to refresh. You may optionally pick a past TMDB export date (YYYY-MM-DD). Leave empty to use today's date."}
          </p>
        </div>
        <label htmlFor="sync-custom-date" className="flex flex-col text-sm text-gray-300">
          {language.startsWith("vi") ? "Ngày xuất TMDB (tùy chọn)" : "TMDB Export Date (optional)"}
          <input
            id="sync-custom-date"
            type="date"
            aria-label="TMDB export date"
            value={customDate}
            onChange={(event) => onCustomDateChange(event.target.value)}
            max={new Date().toISOString().split("T")[0]}
            suppressHydrationWarning
            className="mt-1 rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {SYNC_OPTIONS.map((option) => {
          const busy = syncing === option.key;
          const details = getSyncOptionDetails(option.key, labels);
          return (
            <div
              key={option.key}
              className="flex items-start justify-between rounded-lg border border-gray-700 bg-gray-900 px-4 py-3"
            >
              <div>
                <h3 className="text-lg font-medium text-white">{details.label}</h3>
                <p className="text-sm text-gray-400 mt-1">{details.description}</p>
              </div>
              <button
                type="button"
                aria-label={`Run ${details.label}`}
                onClick={() => { if (isViewer) { showWarning("Không có quyền", "Tài khoản Viewer chỉ có quyền xem"); return; } onSync(option.key); }}
                disabled={busy}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  busy
                    ? "cursor-not-allowed bg-red-900 text-red-300"
                    : "cursor-pointer bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {busy ? (language.startsWith("vi") ? "Đang đồng bộ..." : "Syncing…") : (language.startsWith("vi") ? "Chạy" : "Run")}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CatalogSettingsSection({
  settings,
  settingsForm,
  savingSettings,
  isViewer,
  onSettingsChange,
  onSave,
}: {
  settings: SyncSettings | null;
  settingsForm: {
    movieCatalogLimit: number;
    tvCatalogLimit: number;
    trendingCatalogLimit: number;
    peopleCacheLimit: number;
    recommendationCacheLimit: number;
  };
  savingSettings: boolean;
  isViewer: boolean;
  onSettingsChange: (patch: Partial<typeof settingsForm>) => void;
  onSave: () => void;
}) {
  const { language } = useLanguage();
  const labels = getAdminUiMessages(language);
  const { showWarning } = useToast();

  return (
    <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {language.startsWith("vi") ? "Cài đặt kích thước danh mục" : "Catalog Size Settings"}
          </h2>
          <p className="text-gray-400 mt-1 max-w-xl text-sm">
            {language.startsWith("vi")
              ? "Cấu hình số lượng mục tối đa được lưu trữ trong cơ sở dữ liệu cho mỗi loại nội dung. Hệ thống sẽ tự động dọn dẹp các mục dư thừa dựa trên độ phổ biến sau khi đồng bộ."
              : "Configure maximum number of items to keep in the database for each content type. Cleanup runs after \"Sync Popular Content\" to trim excess items based on popularity."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="sync-movie-catalog-limit" className="block text-sm font-medium text-gray-300 mb-2">
            {language.startsWith("vi") ? "Giới hạn danh mục phim lẻ" : "Movie Catalog Limit"}
          </label>
          <input
            id="sync-movie-catalog-limit"
            type="number"
            aria-label="Movie catalog limit"
            min="0"
            step="1000"
            value={settingsForm.movieCatalogLimit}
            onChange={(e) =>
              onSettingsChange({ movieCatalogLimit: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            {language.startsWith("vi") ? "Hiện tại: " : "Current: "} {(settings?.movieCatalogLimit ?? 500000).toLocaleString()}
          </p>
        </div>

        <div>
          <label htmlFor="sync-tv-catalog-limit" className="block text-sm font-medium text-gray-300 mb-2">
            {language.startsWith("vi") ? "Giới hạn danh mục phim bộ" : "TV Series Catalog Limit"}
          </label>
          <input
            id="sync-tv-catalog-limit"
            type="number"
            aria-label="TV series catalog limit"
            min="0"
            step="1000"
            value={settingsForm.tvCatalogLimit}
            onChange={(e) =>
              onSettingsChange({ tvCatalogLimit: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            {language.startsWith("vi") ? "Hiện tại: " : "Current: "} {(settings?.tvCatalogLimit ?? 200000).toLocaleString()}
          </p>
        </div>

        <div>
          <label htmlFor="sync-trending-catalog-limit" className="block text-sm font-medium text-gray-300 mb-2">
            {language.startsWith("vi") ? "Giới hạn danh mục Trending" : "Trending Catalog Limit"}
          </label>
          <input
            id="sync-trending-catalog-limit"
            type="number"
            aria-label="Trending catalog limit"
            min="0"
            step="10"
            value={settingsForm.trendingCatalogLimit}
            onChange={(e) =>
              onSettingsChange({ trendingCatalogLimit: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            {language.startsWith("vi") ? "Hiện tại: " : "Current: "} {(settings?.trendingCatalogLimit ?? 100).toLocaleString()}
          </p>
        </div>

        <div>
          <label htmlFor="sync-people-cache-limit" className="block text-sm font-medium text-gray-300 mb-2">
            {language.startsWith("vi") ? "Giới hạn bộ nhớ đệm Diễn viên/Đạo diễn" : "People Cache Limit"}
          </label>
          <input
            id="sync-people-cache-limit"
            type="number"
            aria-label="People cache limit"
            min="0"
            step="1000"
            value={settingsForm.peopleCacheLimit}
            onChange={(e) =>
              onSettingsChange({ peopleCacheLimit: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            {language.startsWith("vi") ? "Hiện tại: " : "Current: "} {(settings?.peopleCacheLimit ?? 10000).toLocaleString()}
          </p>
        </div>

        <div>
          <label htmlFor="sync-recommendation-cache-limit" className="block text-sm font-medium text-gray-300 mb-2">
            {language.startsWith("vi") ? "Giới hạn bộ nhớ đệm Gợi ý" : "Recommendation Cache Limit"}
          </label>
          <input
            id="sync-recommendation-cache-limit"
            type="number"
            aria-label="Recommendation cache limit"
            min="0"
            step="1000"
            value={settingsForm.recommendationCacheLimit}
            onChange={(e) =>
              onSettingsChange({ recommendationCacheLimit: parseInt(e.target.value) || 0 })
            }
            className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            {language.startsWith("vi") ? "Hiện tại: " : "Current: "} {(settings?.recommendationCacheLimit ?? 10000).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => { if (isViewer) { showWarning("Không có quyền", "Tài khoản Viewer chỉ có quyền xem"); return; } onSave(); }}
          disabled={savingSettings}
          className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
            savingSettings
              ? "cursor-not-allowed bg-red-900 text-red-300"
              : "cursor-pointer bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {savingSettings ? labels.saving : (language.startsWith("vi") ? "Lưu cài đặt" : "Save Settings")}
        </button>
      </div>
    </section>
  );
}

function SyncNotesSection() {
  const { language } = useLanguage();

  return (
    <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-3">
        {language.startsWith("vi") ? "Ghi chú & Khuyến nghị" : "Notes & Recommendations"}
      </h3>
      <ul className="space-y-2 text-sm text-gray-300">
        {language.startsWith("vi") ? (
          <>
            <li>
              • Giữ tần suất đồng bộ phù hợp với giới hạn tần suất (rate limits) của TMDB. Tránh lạm dụng đồng bộ thủ công trong môi trường production.
            </li>
            <li>
              • Bảng điều khiển hiển thị bản ghi đồng bộ gần đây nhất được lưu trong bảng `sync_status`.
            </li>
            <li>
              • Khi lên lịch đồng bộ định kỳ, hãy ưu tiên sử dụng các tiến trình chạy ngầm (background jobs) qua cron hoặc queue worker thay vì kích hoạt thủ công.
            </li>
          </>
        ) : (
          <>
            <li>
              • Keep sync frequency aligned with TMDB rate limits. Manual sync should be
              used sparingly in production.
            </li>
            <li>
              • The dashboard above reflects the most recent sync record stored in the
              `sync_status` table.
            </li>
            <li>
              • When scheduling regular syncs, prefer background jobs via cron or queue
              workers instead of manual triggering.
            </li>
          </>
        )}
      </ul>
    </section>
  );
}

interface SyncState {
  stats: DashboardStats | null;
  syncing: SyncTarget | null;
  customDate: string;
  settings: SyncSettings | null;
  settingsForm: {
    movieCatalogLimit: number;
    tvCatalogLimit: number;
    trendingCatalogLimit: number;
    peopleCacheLimit: number;
    recommendationCacheLimit: number;
  };
  savingSettings: boolean;
}

type SyncAction =
  | { type: "SET_STATS"; payload: DashboardStats | null }
  | { type: "SET_SYNCING"; payload: SyncTarget | null }
  | { type: "SET_CUSTOM_DATE"; payload: string }
  | { type: "SET_SETTINGS"; payload: SyncSettings | null }
  | { type: "SET_SETTINGS_FORM"; payload: Partial<SyncState["settingsForm"]> | SyncState["settingsForm"] }
  | { type: "SET_SAVING_SETTINGS"; payload: boolean };

function syncReducer(state: SyncState, action: SyncAction): SyncState {
  switch (action.type) {
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "SET_SYNCING":
      return { ...state, syncing: action.payload };
    case "SET_CUSTOM_DATE":
      return { ...state, customDate: action.payload };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "SET_SETTINGS_FORM":
      return {
        ...state,
        settingsForm: {
          ...state.settingsForm,
          ...action.payload,
        },
      };
    case "SET_SAVING_SETTINGS":
      return { ...state, savingSettings: action.payload };
    default:
      return state;
  }
}

export default function AdminSyncDataPage() {
  const { isViewer } = useAuth();
  const adminApi = useAdminApi();
  const { showSuccess, showError } = useToast();
  const [state, dispatch] = useReducer(syncReducer, {
    stats: null,
    syncing: null,
    customDate: "",
    settings: null,
    settingsForm: {
      movieCatalogLimit: 500000,
      tvCatalogLimit: 200000,
      trendingCatalogLimit: 100,
      peopleCacheLimit: 10000,
      recommendationCacheLimit: 10000,
    },
    savingSettings: false,
  });

  const { stats, syncing, customDate, settings, settingsForm, savingSettings } = state;

  const fetchStats = useCallback(async () => {
    if (!adminApi.isAuthenticated) {
      return;
    }
    try {
      const response = await adminApi.get<DashboardStats>("/admin/dashboard/stats");

      if (response.success && response.data) {
        dispatch({ type: "SET_STATS", payload: response.data });
      } else {
        throw new Error(response.message || "Failed to load dashboard stats");
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      showError("Load failed", error instanceof Error ? error.message : "Failed to load dashboard stats");
    }
  }, [adminApi, showError]);

  const fetchSettings = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    try {
      const response = await adminApi.get<SyncSettings>("/admin/sync/settings");
      if (response.success && response.data) {
        dispatch({ type: "SET_SETTINGS", payload: response.data });
        dispatch({
          type: "SET_SETTINGS_FORM",
          payload: {
            movieCatalogLimit: response.data.movieCatalogLimit ?? 500000,
            tvCatalogLimit: response.data.tvCatalogLimit ?? 200000,
            trendingCatalogLimit: response.data.trendingCatalogLimit ?? 100,
            peopleCacheLimit: response.data.peopleCacheLimit ?? 10000,
            recommendationCacheLimit:
              response.data.recommendationCacheLimit ?? 10000,
          },
        });
      }
    } catch (error) {
      console.error("Error loading sync settings:", error);
    }
  }, [adminApi]);

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, [fetchStats, fetchSettings]);

  const handleSync = async (target: SyncTarget) => {
    if (syncing) return;

    dispatch({ type: "SET_SYNCING", payload: target });

    try {
      const payload = {
        target,
        date: customDate || undefined,
      };

      const response = await adminApi.post("/admin/sync", payload);

      if (!response.success) {
        throw new Error(response.error || response.message || "Sync failed");
      }

      showSuccess("Sync successful", response.message || `Sync "${target}" triggered successfully`);
      await fetchStats();
    } catch (error) {
      console.error("Error triggering sync:", error);
      showError("Sync failed", error instanceof Error ? error.message : "Failed to trigger sync");
    } finally {
      dispatch({ type: "SET_SYNCING", payload: null });
    }
  };

  const handleSaveSettings = async () => {
    if (savingSettings) return;

    dispatch({ type: "SET_SAVING_SETTINGS", payload: true });

    try {
      const response = await adminApi.patch("/admin/sync/settings", settingsForm);

      if (!response.success) {
        throw new Error(response.error || response.message || "Failed to save settings");
      }

      showSuccess("Saved", "Catalog limits updated successfully");
      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      showError("Save failed", error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      dispatch({ type: "SET_SAVING_SETTINGS", payload: false });
    }
  };

  const formattedLastSync = useMemo(() => {
    if (!stats?.lastSyncDate) return "Never";
    return new Date(stats.lastSyncDate).toLocaleString();
  }, [stats]);

  return (
    <div className="space-y-6">
      <SyncPageHeader />
      <SyncStatsSection stats={stats} formattedLastSync={formattedLastSync} />
      <ManualSyncSection
        customDate={customDate}
        syncing={syncing}
        isViewer={isViewer}
        onCustomDateChange={(val) => dispatch({ type: "SET_CUSTOM_DATE", payload: val })}
        onSync={handleSync}
      />
      <CatalogSettingsSection
        settings={settings}
        settingsForm={settingsForm}
        savingSettings={savingSettings}
        isViewer={isViewer}
        onSettingsChange={(patch) =>
          dispatch({ type: "SET_SETTINGS_FORM", payload: patch })
        }
        onSave={handleSaveSettings}
      />
      <SyncNotesSection />
    </div>
  );
}
