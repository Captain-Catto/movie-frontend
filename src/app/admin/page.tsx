"use client";

import StatsCard from "@/components/admin/StatsCard";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

export default function AdminDashboard() {
  const {
    stats,
    loading,
    syncingTarget,
    triggerSync,
  } = useAdminDashboard();

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Overview of your movie streaming platform
          </p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse"
              >
                <div className="h-20"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Movies"
              value={stats.totalMovies}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              }
              color="bg-blue-500"
            />

            <StatsCard
              title="Total TV Series"
              value={stats.totalTVSeries}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v8h12V6H4z" />
                </svg>
              }
              color="bg-purple-500"
            />

            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              }
              color="bg-green-500"
              trend={stats.monthlyGrowth}
            />

            <StatsCard
              title="Total Content"
              value={stats.totalContent}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              }
              color="bg-yellow-500"
            />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-center">
              Failed to load dashboard statistics
            </p>
          </div>
        )}

        {/* Sync Status Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            Data Synchronization
          </h2>

          {/* Last Sync Info */}
          {stats?.lastSyncDate && (
            <div className="mb-4 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Last Sync</p>
                  <p className="text-white font-semibold">
                    {new Date(stats.lastSyncDate).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    stats.syncStatus === "completed"
                      ? "bg-green-500 text-white"
                      : stats.syncStatus === "running"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {stats.syncStatus}
                </div>
              </div>
            </div>
          )}

          {/* Sync Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => triggerSync("popular")}
              disabled={syncingTarget !== null}
              className={`p-4 rounded-lg border-2 transition-all ${
                syncingTarget === "popular"
                  ? "bg-blue-600 border-blue-500"
                  : "bg-gray-700 border-gray-600 hover:border-blue-500 hover:bg-gray-600"
              } ${syncingTarget !== null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Popular Refresh</h3>
                {syncingTarget === "popular" && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                Quick sync of popular and trending content
              </p>
            </button>

            <button
              onClick={() => triggerSync("all")}
              disabled={syncingTarget !== null}
              className={`p-4 rounded-lg border-2 transition-all ${
                syncingTarget === "all"
                  ? "bg-purple-600 border-purple-500"
                  : "bg-gray-700 border-gray-600 hover:border-purple-500 hover:bg-gray-600"
              } ${syncingTarget !== null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Full Daily Export</h3>
                {syncingTarget === "all" && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                Complete synchronization of all TMDB data
              </p>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/admin/content"
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center mb-3">
              <div className="bg-blue-500 p-2 rounded-lg mr-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Manage Content</h3>
            </div>
            <p className="text-gray-400 text-sm">
              View and manage all movies and TV series
            </p>
          </a>

          <a
            href="/admin/users"
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors"
          >
            <div className="flex items-center mb-3">
              <div className="bg-green-500 p-2 rounded-lg mr-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">User Management</h3>
            </div>
            <p className="text-gray-400 text-sm">
              View and manage registered users
            </p>
          </a>

          <a
            href="/admin/analytics"
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors"
          >
            <div className="flex items-center mb-3">
              <div className="bg-purple-500 p-2 rounded-lg mr-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Analytics</h3>
            </div>
            <p className="text-gray-400 text-sm">
              View platform statistics and insights
            </p>
          </a>
        </div>
      </div>
  );
}
