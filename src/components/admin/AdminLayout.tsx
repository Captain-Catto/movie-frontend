"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useAdminAnalyticsSocket } from "@/hooks/useAdminAnalyticsSocket";
import AdminSidebar from "./AdminSidebar";
import AdminMetricsBar from "./AdminMetricsBar";
import { AdminAnalyticsProvider } from "@/context/AdminAnalyticsContext";
import type { Metric } from "@/hooks/useAdminMetrics";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const analytics = useAdminAnalyticsSocket();
  const metrics = useMemo<Metric[]>(() => {
    const views = analytics.snapshot?.views ?? 0;
    const clicks = analytics.snapshot?.clicks ?? 0;
    const plays = analytics.snapshot?.plays ?? 0;
    const favorites = analytics.snapshot?.favorites ?? 0;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    const favRate = views > 0 ? (favorites / views) * 100 : 0;

    const formatCompactNumber = (value: number) => {
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
      return value.toString();
    };

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
  }, [analytics.snapshot]);

  const sidebarOpen = true;
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  useEffect(() => {
    const isAdminRole =
      user?.role === "admin" ||
      user?.role === "super_admin" ||
      user?.role === "viewer";

    if (!isLoading && (!isAuthenticated || !isAdminRole)) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render admin content for non-admin users
  const isAdminRole =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.role === "viewer";

  if (!isAuthenticated || !isAdminRole) {
    return null;
  }

  return (
    <AdminAnalyticsProvider
      value={{
        snapshot: analytics.snapshot,
        isConnected: analytics.isConnected,
        lastUpdateAt: analytics.lastUpdateAt,
      }}
    >
      <div className="min-h-screen bg-gray-900">
        <div className="flex">
          <AdminSidebar isOpen={sidebarOpen} user={user} />
          <main
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? "ml-64" : "ml-0"
            }`}
          >
            <div className="p-6 space-y-6">
              <AdminMetricsBar metrics={metrics} />
              {user?.role === "viewer" && (
                <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-yellow-200 text-sm font-medium">
                      Read-Only Mode - Changes will not be saved
                    </span>
                  </div>
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAnalyticsProvider>
  );
}
