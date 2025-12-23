import { useMemo, useState } from "react";
import { DatePreset, DateRange } from "@/types/analytics.types";

interface UseAnalyticsDateRangeReturn {
  datePreset: DatePreset;
  setDatePreset: (preset: DatePreset) => void;
  customDateRange: { startDate: string; endDate: string };
  setCustomDateRange: (range: { startDate: string; endDate: string }) => void;
  dateRange: DateRange;
}

export function useAnalyticsDateRange(): UseAnalyticsDateRangeReturn {
  const [datePreset, setDatePreset] = useState<DatePreset>("7d");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (datePreset) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
      case "1y":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "custom":
        return {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
        };
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [datePreset, customDateRange]);

  return {
    datePreset,
    setDatePreset,
    customDateRange,
    setCustomDateRange,
    dateRange,
  };
}
