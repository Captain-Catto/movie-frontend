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
      <div className="flex flex-col gap-2 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle sidebar"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white">
                Admin Dashboard
              </h1>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ${
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
                <span>{isConnected ? "Live" : "Paused"}</span>
                {lastUpdateAt && (
                  <span className="text-[10px] text-gray-200/80">
                    {lastUpdateAt.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-gray-750 border border-gray-700">
            <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="text-xs leading-tight">
              <p className="text-white font-medium">{user?.name || "Admin"}</p>
              <p className="text-gray-400 capitalize">{user?.role || "admin"}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-[640px]">
            {metrics.map((metric, idx) => (
              <div
                key={metric.label}
                className="flex items-center gap-3 bg-gray-100 text-gray-800 rounded-lg px-3 py-2 shadow-sm border border-gray-200 min-w-[180px]"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold ${
                    ["bg-blue-600", "bg-blue-500", "bg-purple-600", "bg-indigo-600", "bg-green-600", "bg-amber-500"][
                      idx % 6
                    ]
                  }`}
                >
                  {metric.label.split(" ").map((w) => w[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-gray-700">
                    {metric.label}
                  </p>
                  <p className="text-base font-bold leading-tight">
                    {metric.value}
                  </p>
                  <p className="text-[10px] text-gray-500">{metric.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
