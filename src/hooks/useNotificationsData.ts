import { useCallback, useEffect, useReducer, useRef } from "react";
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
  titleVi: "",
  messageVi: "",
  titleEn: "",
  messageEn: "",
  targetType: "all",
  targetValue: "",
  notificationType: "info",
  userId: "",
  role: "user",
  maintenanceStartTime: "",
  maintenanceEndTime: "",
  actionUrl: "",
  imageUrl: "",
};

interface NotificationsState {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  pagination: PaginationMeta;
  filters: NotificationFilters;
  sendModal: SendModalState;
  formData: NotificationFormData;
}

type NotificationsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { notifications: Notification[]; pagination?: PaginationMeta } }
  | { type: "FETCH_FAILURE" }
  | { type: "FETCH_STATS_SUCCESS"; payload: NotificationStats | null }
  | { type: "SET_PAGINATION"; payload: PaginationMeta }
  | { type: "SET_FILTERS"; payload: NotificationFilters }
  | { type: "SET_SEND_MODAL"; payload: SendModalState }
  | { type: "SET_FORM_DATA"; payload: NotificationFormData }
  | { type: "RESET_FORM" }
  | { type: "CLOSE_MODAL" };

function notificationsReducer(state: NotificationsState, action: NotificationsAction): NotificationsState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        notifications: action.payload.notifications,
        pagination: action.payload.pagination ? { ...state.pagination, ...action.payload.pagination } : state.pagination,
      };
    case "FETCH_FAILURE":
      return { ...state, loading: false, notifications: [] };
    case "FETCH_STATS_SUCCESS":
      return { ...state, stats: action.payload };
    case "SET_PAGINATION":
      return { ...state, pagination: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: action.payload, pagination: { ...state.pagination, page: 1 } };
    case "SET_SEND_MODAL":
      return { ...state, sendModal: action.payload };
    case "SET_FORM_DATA":
      return { ...state, formData: action.payload };
    case "RESET_FORM":
      return { ...state, formData: DEFAULT_FORM_DATA };
    case "CLOSE_MODAL":
      return {
        ...state,
        sendModal: { open: false, type: "broadcast" },
        formData: DEFAULT_FORM_DATA,
      };
    default:
      return state;
  }
}

export function useNotificationsData(): UseNotificationsDataReturn {
  const [state, dispatch] = useReducer(notificationsReducer, {
    notifications: [],
    stats: null,
    loading: true,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    filters: {
      type: "all",
      startDate: "",
      endDate: "",
    },
    sendModal: {
      open: false,
      type: "broadcast",
    },
    formData: DEFAULT_FORM_DATA,
  });

  const adminApi = useAdminApi();

  const paginationRef = useRef(state.pagination);
  paginationRef.current = state.pagination;

  const filtersRef = useRef(state.filters);
  filtersRef.current = state.filters;

  const setPagination = useCallback((action: React.SetStateAction<PaginationMeta>) => {
    dispatch({
      type: "SET_PAGINATION",
      payload: typeof action === "function" ? (action as (prev: PaginationMeta) => PaginationMeta)(paginationRef.current) : action,
    });
  }, []);

  const setFilters = useCallback((action: React.SetStateAction<NotificationFilters>) => {
    dispatch({
      type: "SET_FILTERS",
      payload: typeof action === "function" ? (action as (prev: NotificationFilters) => NotificationFilters)(filtersRef.current) : action,
    });
  }, []);

  const sendModalRef = useRef(state.sendModal);
  sendModalRef.current = state.sendModal;

  const setSendModal = useCallback((action: React.SetStateAction<SendModalState>) => {
    dispatch({
      type: "SET_SEND_MODAL",
      payload: typeof action === "function" ? (action as (prev: SendModalState) => SendModalState)(sendModalRef.current) : action,
    });
  }, []);

  const formDataRef = useRef(state.formData);
  formDataRef.current = state.formData;

  const setFormData = useCallback((action: React.SetStateAction<NotificationFormData>) => {
    dispatch({
      type: "SET_FORM_DATA",
      payload: typeof action === "function" ? (action as (prev: NotificationFormData) => NotificationFormData)(formDataRef.current) : action,
    });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
  }, []);

  const handleCloseModal = useCallback(() => {
    dispatch({ type: "CLOSE_MODAL" });
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    try {
      const activePagination = paginationRef.current;
      const activeFilters = filtersRef.current;

      // Build query params
      const params = new URLSearchParams({
        page: activePagination.page.toString(),
        limit: activePagination.limit.toString(),
      });

      if (activeFilters.type !== "all") {
        params.append("type", activeFilters.type);
      }
      if (activeFilters.startDate) {
        params.append("startDate", activeFilters.startDate);
      }
      if (activeFilters.endDate) {
        params.append("endDate", activeFilters.endDate);
      }

      const response = await adminApi.get<{
        notifications?: unknown[];
        total?: number;
        totalPages?: number;
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

        // Update pagination meta if available
        let newPagination: PaginationMeta | undefined;
        if (
          typeof response.data.total === "number" ||
          typeof response.data.totalPages === "number"
        ) {
          newPagination = {
            total: response.data?.total ?? 0,
            page: activePagination.page,
            limit: activePagination.limit,
            totalPages:
              response.data?.totalPages ??
              Math.ceil((response.data?.total ?? 0) / activePagination.limit),
          };
        } else if (response.data.meta || response.data.pagination) {
          const metaObj = (response.data.meta || response.data.pagination) as Record<string, unknown>;
          newPagination = {
            total: (metaObj.total as number) || 0,
            page: (metaObj.page as number) || activePagination.page,
            limit: (metaObj.limit as number) || activePagination.limit,
            totalPages:
              (metaObj.totalPages as number) ||
              Math.ceil(
                ((metaObj.total as number) || 0) /
                  ((metaObj.limit as number) || 10)
              ),
          };
        }

        dispatch({
          type: "FETCH_SUCCESS",
          payload: { notifications: normalizedNotifications, pagination: newPagination },
        });
      } else {
        console.error("❌ Failed to fetch notifications");
        dispatch({ type: "FETCH_FAILURE" });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      dispatch({ type: "FETCH_FAILURE" });
    }
  }, [adminApi]);

  const fetchStats = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    try {
      const response = await adminApi.get<NotificationStats>(
        "/admin/notifications/stats"
      );

      if (response.success && response.data) {
        dispatch({
          type: "FETCH_STATS_SUCCESS",
          payload: {
            totalSent: response.data.totalSent ?? 0,
            totalUsers: response.data.totalUsers ?? 0,
            totalRead: response.data.totalRead ?? 0,
            totalUnread: response.data.totalUnread ?? 0,
          },
        });
      } else {
        dispatch({ type: "FETCH_STATS_SUCCESS", payload: null });
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
  }, [fetchNotifications, fetchStats, adminApi.isAuthenticated, state.pagination.page, state.pagination.limit, state.filters.type, state.filters.startDate, state.filters.endDate]);

  const handleSendNotification = useCallback(async () => {
    try {
      let url = "/admin/notifications/";
      const activeFormData = formDataRef.current;
      const activeSendModal = sendModalRef.current;

      const payload: {
        title: string;
        message: string;
        titleVi?: string;
        messageVi?: string;
        titleEn?: string;
        messageEn?: string;
        type: string;
        actionUrl?: string;
        targetType?: string;
        role?: string;
        userId?: number;
        priority?: number;
        metadata?: Record<string, string>;
      } = {
        title: activeFormData.titleEn || activeFormData.titleVi || activeFormData.title,
        message: activeFormData.messageEn || activeFormData.messageVi || activeFormData.message,
        titleVi: activeFormData.titleVi || undefined,
        messageVi: activeFormData.messageVi || undefined,
        titleEn: activeFormData.titleEn || undefined,
        messageEn: activeFormData.messageEn || undefined,
        type: activeFormData.notificationType,
        actionUrl: activeFormData.actionUrl || undefined,
      };

      if (activeFormData.imageUrl) {
        payload.metadata = { ...(payload.metadata || {}), imageUrl: activeFormData.imageUrl };
      }

      switch (activeSendModal.type) {
        case "broadcast":
          url += "broadcast";
          payload.targetType = "all";
          break;
        case "role":
          url += "role";
          payload.role = activeFormData.role;
          break;
        case "user":
          url += "user";
          payload.userId = parseInt(activeFormData.userId);
          break;
        case "maintenance":
          url += "maintenance";
          payload.targetType = "all";
          payload.priority = 3;
          payload.type = "warning";
          payload.metadata = {};
          if (activeFormData.maintenanceStartTime) {
            payload.metadata.startTime = activeFormData.maintenanceStartTime;
          }
          if (activeFormData.maintenanceEndTime) {
            payload.metadata.endTime = activeFormData.maintenanceEndTime;
          }
          if (activeFormData.imageUrl) {
            payload.metadata.imageUrl = activeFormData.imageUrl;
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
  }, [adminApi, handleCloseModal, fetchNotifications, fetchStats]);

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
    notifications: state.notifications,
    stats: state.stats,
    loading: state.loading,
    pagination: state.pagination,
    filters: state.filters,
    sendModal: state.sendModal,
    formData: state.formData,
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
