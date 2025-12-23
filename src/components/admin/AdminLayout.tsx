"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useAdminAnalyticsSocket } from "@/hooks/useAdminAnalyticsSocket";
import AdminSidebar from "./AdminSidebar";
import Link from "next/link";
import {
  Eye,
  MousePointerClick,
  Play,
  TrendingUp,
  Heart,
  Star,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

interface Metric {
  label: string;
  value: string;
  hint: string;
}

const iconBgColors = [
  "bg-sky-600", // 1
  "bg-sky-600", // 2
  "bg-red-600", // 3
  "bg-red-600", // 4
  "bg-amber-500", // 5
  "bg-amber-500", // 6
];

const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

const metricIcons = [
  // Eye (views)
  <Eye key="views" className="w-5 h-5" strokeWidth={2} />,
  // Cursor click
  <MousePointerClick key="clicks" className="w-5 h-5" strokeWidth={2} />,
  // Play
  <Play key="plays" className="w-5 h-5" fill="currentColor" />,
  // Trend up
  <TrendingUp key="ctr" className="w-5 h-5" strokeWidth={2} />,
  // Heart
  <Heart key="favorites" className="w-5 h-5" fill="currentColor" stroke="none" />,
  // Star rate
  <Star key="fav-rate" className="w-5 h-5" fill="currentColor" stroke="none" />,
];

function AnalyticsBar({ metrics }: { metrics: Metric[] }) {
  if (!metrics.length) return null;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-max pr-2 pt-1">
          {metrics.map((metric, idx) => (
            <Link
              href="/admin/analytics"
              key={metric.label}
              className="flex items-start gap-3 bg-gray-800 text-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-700 min-w-[185px] hover:-translate-y-[1px] hover:shadow-lg hover:border-gray-600 transition"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
                  iconBgColors[idx % iconBgColors.length]
                }`}
              >
                {metricIcons[idx] || metricIcons[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-300 truncate">
                  {metric.label}
                </p>
                <p className="text-lg font-bold leading-tight text-white">
                  {metric.value}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {metric.hint}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const sidebarOpen = true;
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { snapshot } = useAdminAnalyticsSocket();

  const metrics = useMemo<Metric[]>(() => {
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

  // Redirect non-admin users
  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated ||
        (user?.role !== "admin" && user?.role !== "super_admin"))
    ) {
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
  if (
    !isAuthenticated ||
    (user?.role !== "admin" && user?.role !== "super_admin")
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} user={user} />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="p-6 space-y-6">
            <AnalyticsBar metrics={metrics} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
