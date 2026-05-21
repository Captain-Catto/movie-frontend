"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const STATUS_COLORS = ["#22c55e", "#ef4444"];
const LENGTH_COLORS = ["#a855f7", "#fb923c"];

interface ChartEntry {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface SeoChartsSectionProps {
  statusChartData: ChartEntry[];
  lengthChartData: ChartEntry[];
}

export default function SeoChartsSection({
  statusChartData,
  lengthChartData,
}: SeoChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Status mix</h3>
            <p className="text-sm text-gray-400">Active vs inactive coverage</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {statusChartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                }}
                itemStyle={{ color: "#e5e7eb" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Copy length health
            </h3>
            <p className="text-sm text-gray-400">
              Average characters vs recommendations
            </p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lengthChartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                }}
                itemStyle={{ color: "#e5e7eb" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {lengthChartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={LENGTH_COLORS[index % LENGTH_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
