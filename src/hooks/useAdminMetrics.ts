import { useMemo } from "react";
import { useAdminAnalyticsSocket } from "./useAdminAnalyticsSocket";

export interface Metric {
  label: string;
  value: string;
  hint: string;
}

const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

export function useAdminMetrics() {
  const { snapshot, isConnected, lastUpdateAt } = useAdminAnalyticsSocket();

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

  return {
    metrics,
    isConnected,
    lastUpdateAt,
  };
}
