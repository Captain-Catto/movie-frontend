import Image from "next/image";
import type { SyntheticEvent } from "react";
import type {
  WatchHistoryResponse,
  WatchActionType,
  WatchContentType,
} from "./types";
import { formatDateTime, formatDuration } from "./utils";

interface AdminUserWatchTabProps {
  watchHistory: WatchHistoryResponse | null;
  watchLoading: boolean;
  watchAction: WatchActionType;
  watchContentType: WatchContentType;
  watchStartDate: string;
  watchEndDate: string;
  fallbackPoster: string;
  onWatchActionChange: (value: WatchActionType) => void;
  onWatchContentTypeChange: (value: WatchContentType) => void;
  onWatchStartDateChange: (value: string) => void;
  onWatchEndDateChange: (value: string) => void;
  onRefreshWatchHistory: () => void;
  onWatchPageChange: (direction: "previous" | "next") => void;
  onClose: () => void;
}

export default function AdminUserWatchTab({
  watchHistory,
  watchLoading,
  watchAction,
  watchContentType,
  watchStartDate,
  watchEndDate,
  fallbackPoster,
  onWatchActionChange,
  onWatchContentTypeChange,
  onWatchStartDateChange,
  onWatchEndDateChange,
  onRefreshWatchHistory,
  onWatchPageChange,
  onClose,
}: AdminUserWatchTabProps) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="rounded-lg border border-gray-700 bg-gray-700/40 p-3">
          <div className="text-xs text-gray-400">Views</div>
          <div className="mt-1 text-xl font-semibold text-white">
            {watchHistory?.summary.totalViews ?? 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-700/40 p-3">
          <div className="text-xs text-gray-400">Plays</div>
          <div className="mt-1 text-xl font-semibold text-white">
            {watchHistory?.summary.totalPlays ?? 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-700/40 p-3">
          <div className="text-xs text-gray-400">Completed</div>
          <div className="mt-1 text-xl font-semibold text-white">
            {watchHistory?.summary.totalCompletes ?? 0}
          </div>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-700/40 p-3">
          <div className="text-xs text-gray-400">Watch time</div>
          <div className="mt-1 text-xl font-semibold text-white">
            {formatDuration(watchHistory?.summary.totalWatchTimeSeconds)}
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <select
          aria-label="Filter by action type"
          value={watchAction}
          onChange={(e) => onWatchActionChange(e.target.value as WatchActionType)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="all">All actions</option>
          <option value="view">View</option>
          <option value="play">Play</option>
          <option value="complete">Complete</option>
        </select>
        <select
          aria-label="Filter by content type"
          value={watchContentType}
          onChange={(e) => onWatchContentTypeChange(e.target.value as WatchContentType)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="all">All content</option>
          <option value="movie">Movies</option>
          <option value="tv_series">TV series</option>
        </select>
        <input
          type="date"
          aria-label="Start date"
          value={watchStartDate}
          onChange={(e) => onWatchStartDateChange(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <input
          type="date"
          aria-label="End date"
          value={watchEndDate}
          onChange={(e) => onWatchEndDateChange(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <button
          type="button"
          onClick={onRefreshWatchHistory}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-gray-700/30 rounded-lg border border-gray-600 max-h-[420px] overflow-y-auto">
        {watchLoading ? (
          <div className="p-8 text-center text-gray-400">Loading watch history…</div>
        ) : !watchHistory || watchHistory.data.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No watch history found</div>
        ) : (
          <div className="divide-y divide-gray-600">
            {watchHistory.data.map((item) => (
              <div key={item.id} className="flex gap-3 p-4 hover:bg-gray-700/50 transition-colors">
                <Image
                  src={item.posterUrl || fallbackPoster}
                  alt={item.contentTitle}
                  width={56}
                  height={80}
                  className="rounded object-cover bg-gray-800"
                  unoptimized
                  onError={(e: SyntheticEvent<HTMLImageElement>) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackPoster;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.href ? (
                      <a
                         href={item.href}
                         target="_blank"
                         rel="noreferrer"
                         className="line-clamp-1 font-medium text-white hover:text-red-300"
                      >
                        {item.contentTitle}
                      </a>
                    ) : (
                      <div className="line-clamp-1 font-medium text-white">{item.contentTitle}</div>
                    )}
                    <span className="rounded bg-gray-600 px-2 py-0.5 text-[11px] uppercase text-gray-100">
                      {item.contentType === "tv_series" ? "TV" : "Movie"}
                    </span>
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[11px] uppercase text-white">
                      {item.actionType}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-gray-400 sm:grid-cols-2">
                    <div>{formatDateTime(item.createdAt)}</div>
                    <div>Duration: {formatDuration(item.duration)}</div>
                    <div className="capitalize">Device: {item.deviceType || "N/A"}</div>
                    <div>Country: {item.country || "N/A"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {watchHistory && watchHistory.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
          <span>
            Page {watchHistory.page} of {watchHistory.totalPages} · {watchHistory.total} records
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={watchHistory.page <= 1 || watchLoading}
              onClick={() => onWatchPageChange("previous")}
              className="px-3 py-1.5 rounded bg-gray-700 text-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={watchHistory.page >= watchHistory.totalPages || watchLoading}
              onClick={() => onWatchPageChange("next")}
              className="px-3 py-1.5 rounded bg-gray-700 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </>
  );
}
