import { useState, useCallback, useEffect } from "react";
import { useAdminApi } from "./useAdminApi";
import { useToastRedux } from "./useToastRedux";

export interface DashboardStats {
  totalMovies: number;
  totalTVSeries: number;
  totalUsers: number;
  totalContent: number;
  todaySignups: number;
  monthlyGrowth: number;
  lastSyncDate: string | null;
  syncStatus: string;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingTarget, setSyncingTarget] = useState<"all" | "popular" | null>(
    null
  );
  const adminApi = useAdminApi();
  const { showSuccess, showError } = useToastRedux();

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await adminApi.get<DashboardStats>(
        "/admin/dashboard/stats"
      );

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [adminApi]);

  const triggerSync = useCallback(
    async (target: "all" | "popular") => {
      setSyncingTarget(target);

      try {
        const response = await adminApi.post<{ message: string }>(
          "/admin/sync",
          { target }
        );

        if (!response.success) {
          throw new Error(response.error || "Failed to trigger sync");
        }

        const label = target === "all" ? "Full daily export" : "Popular refresh";
        showSuccess(
          "Sync successful",
          response.data?.message || `${label} sync started successfully`
        );
        await fetchDashboardStats();
      } catch (error) {
        console.error("Error triggering sync:", error);
        showError(
          "Sync failed",
          error instanceof Error ? error.message : "Failed to trigger sync task"
        );
      } finally {
        setSyncingTarget(null);
      }
    },
    [adminApi, fetchDashboardStats, showSuccess, showError]
  );

  useEffect(() => {
    if (adminApi.isAuthenticated) {
      fetchDashboardStats();
    }
  }, [adminApi.isAuthenticated, fetchDashboardStats]);

  return {
    stats,
    loading,
    syncingTarget,
    triggerSync,
    refetchStats: fetchDashboardStats,
  };
}
