"use client";

import dynamic from "next/dynamic";
import { FavoriteStats } from "@/types/analytics.types";
import { CHART_COLORS } from "@/types/analytics.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocaleFromLanguage } from "@/constants/app.constants";

const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });

interface AnalyticsFavoritesChartProps {
  favoriteStats: FavoriteStats | null;
}

export default function AnalyticsFavoritesChart({
  favoriteStats,
}: AnalyticsFavoritesChartProps) {
  const { language } = useLanguage();
  const locale = getLocaleFromLanguage(language);
  const hasTrendData = favoriteStats?.trend && favoriteStats.trend.length > 0;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-2">Favorites Over Time</h2>
      <p className="text-sm text-gray-400 mb-4">
        Trend is limited to the last 30 days (backend constraint)
      </p>
      {hasTrendData ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={(favoriteStats?.trend ?? []).map((item) => ({
              date: item.date,
              favorites: Number(item.count ?? 0),
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tickFormatter={(value: string | number) =>
                new Date(value).toLocaleDateString(locale, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#F3F4F6",
              }}
              labelFormatter={(value: string | number) =>
                new Date(value).toLocaleDateString(locale)
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="favorites"
              stroke={CHART_COLORS.success}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.success }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No data available for the selected period
        </div>
      )}
    </div>
  );
}
