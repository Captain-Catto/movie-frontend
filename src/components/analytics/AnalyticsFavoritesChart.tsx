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
import { FavoriteStats } from "@/types/analytics.types";
import { CHART_COLORS } from "@/types/analytics.types";

interface AnalyticsFavoritesChartProps {
  favoriteStats: FavoriteStats | null;
}

export default function AnalyticsFavoritesChart({
  favoriteStats,
}: AnalyticsFavoritesChartProps) {
  const hasTrendData = favoriteStats?.trend && favoriteStats.trend.length > 0;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-2">Favorites Over Time</h2>
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
