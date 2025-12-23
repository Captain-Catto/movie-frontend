import Link from "next/link";
import {
  Eye,
  MousePointerClick,
  Play,
  TrendingUp,
  Heart,
  Star,
} from "lucide-react";
import { Metric } from "@/hooks/useAdminMetrics";

interface AdminMetricsBarProps {
  metrics: Metric[];
}

const iconBgColors = [
  "bg-sky-600",
  "bg-sky-600",
  "bg-red-600",
  "bg-red-600",
  "bg-amber-500",
  "bg-amber-500",
];

const metricIcons = [
  <Eye key="views" className="w-5 h-5" strokeWidth={2} />,
  <MousePointerClick key="clicks" className="w-5 h-5" strokeWidth={2} />,
  <Play key="plays" className="w-5 h-5" fill="currentColor" />,
  <TrendingUp key="ctr" className="w-5 h-5" strokeWidth={2} />,
  <Heart key="favorites" className="w-5 h-5" fill="currentColor" stroke="none" />,
  <Star key="fav-rate" className="w-5 h-5" fill="currentColor" stroke="none" />,
];

export default function AdminMetricsBar({ metrics }: AdminMetricsBarProps) {
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
