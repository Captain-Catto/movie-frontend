"use client";

import dynamic from "next/dynamic";
import { ViewStats } from "@/types/analytics.types";
import { CHART_COLORS } from "@/types/analytics.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocaleFromLanguage } from "@/constants/app.constants";
import { getAdminUiMessages } from "@/lib/ui-messages";

const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });

interface AnalyticsViewChartProps {
  viewStats: ViewStats[];
}

export default function AnalyticsViewChart({ viewStats }: AnalyticsViewChartProps) {
  const { language } = useLanguage();
  const locale = getLocaleFromLanguage(language);
  const labels = getAdminUiMessages(language);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-2">{labels.analyticsViewsOverTime}</h2>
      <p className="text-sm text-gray-400 mb-4">
        {labels.analyticsChartConstraint}
      </p>
      {viewStats.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={viewStats}>
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
              labelFormatter={(value: React.ReactNode) =>
                new Date(value as string | number).toLocaleDateString(locale)
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="views"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.primary }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          {labels.analyticsNoDataPeriod}
        </div>
      )}
    </div>
  );
}
