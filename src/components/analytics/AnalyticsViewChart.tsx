import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ViewStats } from "@/types/analytics.types";
import { CHART_COLORS } from "@/types/analytics.types";

interface AnalyticsViewChartProps {
  viewStats: ViewStats[];
}

export default function AnalyticsViewChart({ viewStats }: AnalyticsViewChartProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-2">Views Over Time</h2>
      <p className="text-sm text-gray-400 mb-4">
        Trend is limited to the last 30 days (backend constraint)
      </p>
      {viewStats.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={viewStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tickFormatter={(value: string | number) =>
                new Date(value).toLocaleDateString("en-US", {
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
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
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
          No data available for the selected period
        </div>
      )}
    </div>
  );
}
