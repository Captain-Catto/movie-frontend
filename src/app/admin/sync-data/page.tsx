"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsCard from "@/components/admin/StatsCard";
import { API_BASE_URL } from "@/services/api";

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

type SyncTarget = "all" | "movies" | "tv" | "today" | "popular";

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
      key: "today",
      label: "Latest Exports",
      description: "Pull the most recent TMDB daily exports.",
    },
  ];

export default function AdminSyncDataPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [syncing, setSyncing] = useState<SyncTarget | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState<string>("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Missing authentication token");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || "Failed to load dashboard stats");
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to load dashboard stats.");
    }
  };

  const handleSync = async (target: SyncTarget) => {
    if (syncing) return;

    setSuccessMessage(null);
    setErrorMessage(null);
    setSyncing(target);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Missing authentication token");
      }

      const payload = {
        target,
        date: customDate || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/admin/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Sync failed");
      }

      setSuccessMessage(data.message || `Sync "${target}" triggered successfully.`);
      await fetchStats();
    } catch (error) {
      console.error("Error triggering sync:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to trigger sync.");
    } finally {
      setSyncing(null);
    }
  };

  const formattedLastSync = useMemo(() => {
    if (!stats?.lastSyncDate) return "Never";
    return new Date(stats.lastSyncDate).toLocaleString();
  }, [stats]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-white">Data Synchronization</h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Manually trigger TMDB import jobs for movies and TV series. Use this
            when you need fresh catalog data immediately, outside of scheduled
            jobs.
          </p>
        </header>

        {successMessage && (
          <div className="rounded-md border border-green-500/40 bg-green-500/10 px-4 py-3 text-green-200">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Movies"
            value={stats?.totalMovies ?? 0}
            color="bg-blue-600"
            icon={
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
            title="Total TV Series"
            value={stats?.totalTVSeries ?? 0}
            color="bg-purple-600"
            icon={
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
            title="Last Sync"
            value={formattedLastSync}
            color="bg-amber-600"
            icon={
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
            title="Sync Status"
            value={stats?.syncStatus ?? "unknown"}
            color="bg-slate-600"
            icon={
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

        <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Manual Sync Controls
              </h2>
              <p className="text-gray-400 mt-1 max-w-xl">
                Choose the dataset you want to refresh. You may optionally pick a
                past TMDB export date (YYYY-MM-DD). Leave empty to use today&apos;s
                date.
              </p>
            </div>
            <label className="flex flex-col text-sm text-gray-300">
              TMDB Export Date (optional)
              <input
                type="date"
                value={customDate}
                onChange={(event) => setCustomDate(event.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="mt-1 rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </label>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {SYNC_OPTIONS.map((option) => {
              const busy = syncing === option.key;
              return (
                <div
                  key={option.key}
                  className="flex items-start justify-between rounded-lg border border-gray-700 bg-gray-900 px-4 py-3"
                >
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSync(option.key)}
                    disabled={busy}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      busy
                        ? "cursor-not-allowed bg-red-900 text-red-300"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {busy ? "Syncing…" : "Run"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Notes & Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              • Keep sync frequency aligned with TMDB rate limits. Manual sync should
              be used sparingly in production.
            </li>
            <li>
              • The dashboard above reflects the most recent sync record stored in
              the `sync_status` table.
            </li>
            <li>
              • When scheduling regular syncs, prefer background jobs via cron or queue
              workers instead of manual triggering.
            </li>
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}
