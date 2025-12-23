"use client";

import { useMemo } from "react";
import { useAdminAnalyticsSocket } from "@/hooks/useAdminAnalyticsSocket";

interface AdminUser {
  name?: string;
  role?: string;
}

interface AdminTopBarProps {
  onMenuClick: () => void;
  user: AdminUser | null;
}

const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

export default function AdminTopBar({ onMenuClick, user }: AdminTopBarProps) {
  const { snapshot, isConnected, lastUpdateAt } = useAdminAnalyticsSocket();

  const metrics = useMemo(() => {
    const views = snapshot?.views ?? 0;
    const clicks = snapshot?.clicks ?? 0;
    const plays = snapshot?.plays ?? 0;
    const favorites = snapshot?.favorites ?? 0;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    const favRate = views > 0 ? (favorites / views) * 100 : 0;

    return [
      {
        label: "Total Views",
        value: formatCompactNumber(views),
        hint: "VIEW events",
      },
      {
        label: "Total Clicks",
        value: formatCompactNumber(clicks),
        hint: "CLICK events",
      },
      {
        label: "Total Plays",
        value: formatCompactNumber(plays),
        hint: "PLAY events",
      },
      {
        label: "CTR",
        value: `${ctr.toFixed(1)}%`,
        hint: "Clicks / Views",
      },
      {
        label: "Favorites",
        value: formatCompactNumber(favorites),
        hint: "Saved items",
      },
      {
        label: "Favorite Rate",
        value: `${favRate.toFixed(1)}%`,
        hint: "Favorites / Views",
      },
    ];
  }, [snapshot]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800/95 backdrop-blur border-b border-gray-700 z-50 shadow-lg">
      <div className="flex flex-col gap-3 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isConnected
                    ? "bg-green-700/40 text-green-100"
                    : "bg-gray-700 text-gray-300"
                }`}
                title={
                  lastUpdateAt
                    ? `Last update: ${lastUpdateAt.toLocaleTimeString()}`
                    : "Waiting for analytics stream"
                }
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-300 animate-pulse" : "bg-gray-500"
                  }`}
                />
                <span>{isConnected ? "Live analytics" : "Live paused"}</span>
                {lastUpdateAt && (
                  <span className="text-[11px] text-gray-200/80">
                    {lastUpdateAt.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-700">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="text-sm">
                <p className="text-white font-medium">{user?.name || "Admin"}</p>
                <p className="text-gray-400 text-xs capitalize">
                  {user?.role || "admin"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 min-w-[720px]">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-gray-700/70 border border-gray-600 rounded-lg px-4 py-3 text-white shadow-sm"
              >
                <p className="text-[11px] text-gray-300">{metric.label}</p>
                <p className="text-xl font-bold mt-1">{metric.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {metric.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
