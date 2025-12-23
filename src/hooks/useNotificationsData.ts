import { useState, useCallback, useEffect } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import type {
  Notification,
  NotificationStats,
  PaginationMeta,
  NotificationFilters,
  SendModalState,
  NotificationFormData,
  NotificationAnalyticsSummary,
} from "@/types/notifications.types";

interface UseNotificationsDataReturn {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  pagination: PaginationMeta;
  filters: NotificationFilters;
  sendModal: SendModalState;
  formData: NotificationFormData;
  setPagination: React.Dispatch<React.SetStateAction<PaginationMeta>>;
  setFilters: React.Dispatch<React.SetStateAction<NotificationFilters>>;
  setSendModal: React.Dispatch<React.SetStateAction<SendModalState>>;
  setFormData: React.Dispatch<React.SetStateAction<NotificationFormData>>;
  fetchNotifications: () => Promise<void>;
  fetchStats: () => Promise<void>;
  handleSendNotification: () => Promise<void>;
  handleDeleteNotification: (id: number) => Promise<void>;
  handleCloseModal: () => void;
  resetForm: () => void;
}

const DEFAULT_FORM_DATA: NotificationFormData = {
  title: "",
  message: "",
  targetType: "all",
  targetValue: "",
  notificationType: "info",
  userId: "",
  role: "user",
  maintenanceStartTime: "",
  maintenanceEndTime: "",
};

export function useNotificationsData(): UseNotificationsDataReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<NotificationFilters>({
    type: "all",
    startDate: "",
    endDate: "",
  });
  const [sendModal, setSendModal] = useState<SendModalState>({
    open: false,
    type: "broadcast",
  });
  const [formData, setFormData] = useState<NotificationFormData>(DEFAULT_FORM_DATA);

  const adminApi = useAdminApi();

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSendModal({ open: false, type: "broadcast" });
    resetForm();
  }, [resetForm]);

  const fetchNotifications = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    try {
      // Build query params
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.type !== "all") {
        params.append("type", filters.type);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      const response = await adminApi.get<{
        notifications?: unknown[];
        meta?: unknown;
        pagination?: unknown;
      }>(`/admin/notifications?${params.toString()}`);

      if (response.success && response.data) {
        // Ensure data is always an array
        const notificationsArray: unknown[] = Array.isArray(
          response.data.notifications
        )
          ? response.data.notifications
          : Array.isArray(response.data)
          ? (response.data as unknown[])
          : [];

        const normalizedNotifications: Notification[] = notificationsArray.map(
          (notification: unknown) => {
            const notif = notification as Record<string, unknown>;
            return {
              ...notif,
              analytics: {
                totalTargetedUsers:
                  (notif.analytics as NotificationAnalyticsSummary | undefined)
                    ?.totalTargetedUsers ?? 0,
                deliveredCount:
                  (notif.analytics as NotificationAnalyticsSummary | undefined)
                    ?.deliveredCount ?? 0,
                readCount:
                  (notif.analytics as NotificationAnalyticsSummary | undefined)
                    ?.readCount ?? 0,
                dismissedCount:
                  (notif.analytics as NotificationAnalyticsSummary | undefined)
                    ?.dismissedCount ?? 0,
                clickCount:
                  (notif.analytics as NotificationAnalyticsSummary | undefined)
                    ?.clickCount ?? 0,
              },
              createdBy: (notif.createdBy as Notification["createdBy"]) ?? null,
            } as Notification;
          }
        );

        setNotifications(normalizedNotifications);

        // Update pagination meta if available
        if (response.data.meta || response.data.pagination) {
          const meta = response.data.meta || response.data.pagination;
          const metaObj = meta as Record<string, unknown>;
          setPagination({
            total: (metaObj.total as number) || 0,
            page: (metaObj.page as number) || pagination.page,
            limit: (metaObj.limit as number) || pagination.limit,
            totalPages:
              (metaObj.totalPages as number) ||
              Math.ceil(
                ((metaObj.total as number) || 0) /
                  ((metaObj.limit as number) || 10)
              ),
          });
        }
      } else {
        console.error("❌ Failed to fetch notifications");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, adminApi]);

  const fetchStats = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    try {
      const response = await adminApi.get<NotificationStats>(
        "/admin/notifications/stats"
      );

      if (response.success && response.data) {
        setStats({
          totalSent: response.data.totalSent ?? 0,
          totalUsers: response.data.totalUsers ?? 0,
          totalRead: response.data.totalRead ?? 0,
          totalUnread: response.data.totalUnread ?? 0,
        });
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  }, [adminApi]);

  useEffect(() => {
    if (adminApi.isAuthenticated) {
      fetchNotifications();
      fetchStats();
    }
  }, [fetchNotifications, fetchStats, adminApi.isAuthenticated]);

  const handleSendNotification = useCallback(async () => {
    try {
      let url = "/admin/notifications/";
      const payload: {
        title: string;
        message: string;
        type: string;
        targetType?: string;
        role?: string;
        userId?: number;
        priority?: number;
        metadata?: Record<string, string>;
      } = {
        title: formData.title,
        message: formData.message,
        type: formData.notificationType,
      };

      switch (sendModal.type) {
        case "broadcast":
          url += "broadcast";
          payload.targetType = "all";
          break;
        case "role":
          url += "role";
          payload.role = formData.role;
          break;
        case "user":
          url += "user";
          payload.userId = parseInt(formData.userId);
          break;
        case "maintenance":
          url += "maintenance";
          payload.targetType = "all";
          payload.priority = 3; // High priority
          payload.type = "warning"; // Force warning type for maintenance
          payload.metadata = {};
          if (formData.maintenanceStartTime) {
            payload.metadata.startTime = formData.maintenanceStartTime;
          }
          if (formData.maintenanceEndTime) {
            payload.metadata.endTime = formData.maintenanceEndTime;
          }
          break;
      }

      const response = await adminApi.post(url, payload);

      if (response.success) {
        handleCloseModal();
        fetchNotifications();
        fetchStats();
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }, [formData, sendModal.type, adminApi, handleCloseModal, fetchNotifications, fetchStats]);

  const handleDeleteNotification = useCallback(
    async (id: number) => {
      try {
        const response = await adminApi.delete(`/admin/notifications/${id}`);

        if (response.success) {
          fetchNotifications();
          fetchStats();
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },
    [adminApi, fetchNotifications, fetchStats]
  );

  return {
    notifications,
    stats,
    loading,
    pagination,
    filters,
    sendModal,
    formData,
    setPagination,
    setFilters,
    setSendModal,
    setFormData,
    fetchNotifications,
    fetchStats,
    handleSendNotification,
    handleDeleteNotification,
    handleCloseModal,
    resetForm,
  };
}
