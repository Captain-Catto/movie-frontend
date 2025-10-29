"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminLayout from "@/components/admin/AdminLayout";
import { API_BASE_URL } from "@/services/api";

interface AnalyticsOverview {
  totalUsers: number;
  totalMovies: number;
  totalTVShows: number;
  totalViews: number;
  totalFavorites: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
}

interface ViewStats {
  date: string;
  views: number;
  clicks: number;
}

interface PopularContent {
  tmdbId: number;
  title: string;
  contentType: "movie" | "tv";
  viewCount: number;
  clickCount: number;
  favoriteCount: number;
  posterPath?: string;
}

interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
}

interface CountryStats {
  country: string;
  count: number;
  percentage: number;
}

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [viewStats, setViewStats] = useState<ViewStats[]>([]);
  const [popularContent, setPopularContent] = useState<PopularContent[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [contentType, setContentType] = useState<"all" | "movie" | "tv">("all");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const viewParams = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          ...(contentType !== "all" && { contentType }),
        });

        const overviewResponse = await fetch(
          `${API_BASE_URL}/admin/analytics/overview`,
          { headers }
        );
        if (overviewResponse.ok) {
          const overviewData = await overviewResponse.json();
          setOverview(overviewData.data);
        }

        const viewResponse = await fetch(
          `${API_BASE_URL}/admin/analytics/views?${viewParams}`,
          { headers }
        );
        if (viewResponse.ok) {
          const viewData = await viewResponse.json();
          setViewStats(viewData.data || []);
        }

        const popularResponse = await fetch(
          `${API_BASE_URL}/admin/analytics/popular?${viewParams}`,
          { headers }
        );
        if (popularResponse.ok) {
          const popularData = await popularResponse.json();
          setPopularContent(popularData.data || []);
        }

        const deviceResponse = await fetch(
          `${API_BASE_URL}/admin/analytics/devices?${viewParams}`,
          { headers }
        );
        if (deviceResponse.ok) {
          const deviceData = await deviceResponse.json();
          setDeviceStats(deviceData.data || []);
        }

        const countryResponse = await fetch(
          `${API_BASE_URL}/admin/analytics/countries?${viewParams}`,
          { headers }
        );
        if (countryResponse.ok) {
          const countryData = await countryResponse.json();
          setCountryStats(countryData.data || []);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, contentType]);

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h1>
          
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Content Type</label>
              <select
                value={contentType}
                onChange={(e) =>
                  setContentType(e.target.value as "all" | "movie" | "tv")
                }
                className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
              </select>
            </div>
          </div>

          {/* Overview Stats */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">{overview.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Total Movies</h3>
                <p className="text-2xl font-bold text-green-600">{overview.totalMovies.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Total TV Shows</h3>
                <p className="text-2xl font-bold text-purple-600">{overview.totalTVShows.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Total Views</h3>
                <p className="text-2xl font-bold text-red-600">{overview.totalViews.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Total Favorites</h3>
                <p className="text-2xl font-bold text-yellow-600">{overview.totalFavorites.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Daily Active Users</h3>
                <p className="text-2xl font-bold text-indigo-600">{overview.dailyActiveUsers.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-white">Monthly Active Users</h3>
                <p className="text-2xl font-bold text-pink-600">{overview.monthlyActiveUsers.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* View Stats Chart */}
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Views Over Time</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">Loading...</div>
            ) : (
              <div className="h-64 overflow-x-auto">
                <div className="flex items-end justify-between h-full space-x-1 min-w-full">
                  {viewStats.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-blue-500 w-8 rounded-t"
                        style={{
                          height: `${Math.max((stat.views / Math.max(...viewStats.map(s => s.views))) * 200, 2)}px`
                        }}
                        title={`${stat.date}: ${stat.views} views`}
                      />
                      <span className="text-xs mt-1 transform rotate-45 origin-left">
                        {new Date(stat.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Popular Content */}
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Popular Content</h2>
            {loading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {popularContent.slice(0, 10).map((content, index) => (
                  <div key={content.tmdbId} className="flex items-center space-x-3 p-2 border-b border-gray-700">
                    <span className="font-bold text-gray-400">#{index + 1}</span>
                    {content.posterPath && (
                      <div className="relative w-12 h-18">
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${content.posterPath}`}
                          alt={content.title}
                          fill
                          className="object-cover rounded"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{content.title}</h3>
                      <p className="text-sm text-gray-400">
                        {content.contentType} &bull; {content.viewCount} views &bull; {content.favoriteCount} favorites
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device Stats */}
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Device Statistics</h2>
            {loading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-3">
                {deviceStats.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{device.device}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{device.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Country Stats */}
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Geographic Distribution</h2>
            {loading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {countryStats.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{country.country}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{country.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
