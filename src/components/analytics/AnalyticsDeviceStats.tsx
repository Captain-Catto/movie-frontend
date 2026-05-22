import dynamic from "next/dynamic";
import { DeviceStats } from "@/types/analytics.types";
import { DEVICE_COLORS } from "@/types/analytics.types";
import { formatNumber } from "@/utils/analyticsUtils";

const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });

interface AnalyticsDeviceStatsProps {
  deviceStats: DeviceStats[];
}

export default function AnalyticsDeviceStats({
  deviceStats,
}: AnalyticsDeviceStatsProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Device Distribution</h2>
      {deviceStats.length > 0 ? (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <ResponsiveContainer width="50%" height={300}>
            <PieChart>
              <Pie
                data={deviceStats as unknown as Array<Record<string, unknown>>}
                dataKey="count"
                nameKey="device"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(props: { index: number }) => {
                  const entry = deviceStats[props.index];
                  return `${entry.device}: ${entry.percentage.toFixed(1)}%`;
                }}
              >
                {deviceStats.map((entry: DeviceStats, index) => (
                  <Cell
                    key={`cell-${entry.device}`}
                    fill={DEVICE_COLORS[index % DEVICE_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {deviceStats.map((device, index) => (
              <div
                key={device.device}
                className="flex items-center justify-between p-3 bg-gray-700 rounded"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 rounded"
                    style={{
                      backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length],
                    }}
                  />
                  <span className="text-white capitalize">{device.device}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    {formatNumber(device.count)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {device.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          No device data available
        </div>
      )}
    </div>
  );
}
