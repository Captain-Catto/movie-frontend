import { useEffect, useReducer, useCallback, useRef } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToastRedux } from "@/hooks/useToastRedux";

// Import types
import type {
  User,
  UserRole,
  UserFilter,
  BanModalState,
  EditModalState,
  EditFormState,
  AdminUsersTab,
  UserLog,
  WatchHistoryResponse,
  WatchActionType,
  WatchContentType,
} from "@/components/admin/users/types";

export function useAdminUsers() {
  type PageState = {
    users: User[];
    loading: boolean;
    filter: UserFilter;
    banModal: BanModalState;
    banReason: string;
    editModal: EditModalState;
    editForm: EditFormState;
    editSaving: boolean;
    editError: string;
    activeTab: AdminUsersTab;
    userLogs: UserLog[];
    logsLoading: boolean;
    logFilter: string;
    watchHistory: WatchHistoryResponse | null;
    watchLoading: boolean;
    watchAction: WatchActionType;
    watchContentType: WatchContentType;
    watchStartDate: string;
    watchEndDate: string;
  };

  type PageAction = Partial<PageState> | ((s: PageState) => Partial<PageState>);

  const [state, dispatch] = useReducer(
    (s: PageState, a: PageAction): PageState => {
      const patch = typeof a === "function" ? a(s) : a;
      return { ...s, ...patch };
    },
    {
      users: [],
      loading: true,
      filter: "all",
      banModal: { open: false, user: null },
      banReason: "",
      editModal: { open: false, user: null },
      editForm: { name: "", role: "user", password: "" },
      editSaving: false,
      editError: "",
      activeTab: "info",
      userLogs: [],
      logsLoading: false,
      logFilter: "all",
      watchHistory: null,
      watchLoading: false,
      watchAction: "all",
      watchContentType: "all",
      watchStartDate: "",
      watchEndDate: "",
    }
  );

  const {
    users,
    loading,
    filter,
    banModal,
    banReason,
    editModal,
    editForm,
    editSaving,
    editError,
    activeTab,
    userLogs,
    logsLoading,
    logFilter,
    watchHistory,
    watchLoading,
    watchAction,
    watchContentType,
    watchStartDate,
    watchEndDate,
  } = state;

  const watchPageRef = useRef(1);
  const adminApi = useAdminApi();
  const { showSuccess, showError } = useToastRedux();

  const fetchUsers = useCallback(async () => {
    if (!adminApi.isAuthenticated) return;
    dispatch({ loading: true });
    try {
      const response = await adminApi.get<{ items: User[] }>(
        `/admin/users/list?status=${filter}`
      );

      if (response.success && response.data) {
        dispatch({ users: response.data.items });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      dispatch({ loading: false });
    }
  }, [filter, adminApi]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBanUser = async () => {
    if (!banModal.user || !banReason) return;

    const userName = banModal.user.name || banModal.user.email;

    try {
      const response = await adminApi.post("/admin/users/ban", {
        userId: banModal.user.id,
        reason: banReason,
      });

      if (response.success) {
        dispatch({ banModal: { open: false, user: null } });
        dispatch({ banReason: "" });
        fetchUsers();
        showSuccess("User banned", `User "${userName}" has been banned`);
      } else {
        showError("Ban failed", response.error || "Failed to ban user");
      }
    } catch (error) {
      console.error("Error banning user:", error);
      showError("Ban failed", error instanceof Error ? error.message : "Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: number) => {
    const user = users.find((u) => u.id === userId);
    const userName = user?.name || user?.email || `User #${userId}`;

    try {
      const response = await adminApi.post(`/admin/users/unban/${userId}`);

      if (response.success) {
        fetchUsers();
        showSuccess("User unbanned", `User "${userName}" has been unbanned`);
      } else {
        showError("Unban failed", response.error || "Failed to unban user");
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      showError("Unban failed", error instanceof Error ? error.message : "Failed to unban user");
    }
  };

  const roleOptions: UserRole[] = ["user", "admin", "super_admin", "viewer"];
  const fallbackPoster = "/images/no-poster.svg";

  const fetchUserLogs = useCallback(
    async (userId: number) => {
      dispatch({ logsLoading: true });
      try {
        const response = await adminApi.get<{ logs: UserLog[] }>(
          `/admin/users/${userId}/logs`
        );
        if (response.success && response.data) {
          dispatch({ userLogs: response.data.logs || [] });
        }
      } catch (error) {
        console.error("Error fetching user logs:", error);
        dispatch({ userLogs: [] });
      } finally {
        dispatch({ logsLoading: false });
      }
    },
    [adminApi]
  );

  const fetchWatchHistory = useCallback(
    async (userId: number, page: number) => {
      dispatch({ watchLoading: true });
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        if (watchAction !== "all") params.set("actionType", watchAction);
        if (watchContentType !== "all") params.set("contentType", watchContentType);
        if (watchStartDate) params.set("startDate", watchStartDate);
        if (watchEndDate) params.set("endDate", watchEndDate);

        const response = await adminApi.get<WatchHistoryResponse>(
          `/admin/users/${userId}/watch-history?${params.toString()}`
        );

        if (response.success && response.data) {
          dispatch({ watchHistory: response.data });
          watchPageRef.current = response.data.page || page;
        } else {
          dispatch({ watchHistory: null });
        }
      } catch (error) {
        console.error("Error fetching watch history:", error);
        dispatch({ watchHistory: null });
      } finally {
        dispatch({ watchLoading: false });
      }
    },
    [adminApi, watchAction, watchContentType, watchEndDate, watchStartDate]
  );

  const openEditModal = (user: User) => {
    dispatch({
      editModal: { open: true, user },
      editForm: { name: user.name || "", role: user.role, password: "" },
    });
    dispatch({ editError: "" });
    dispatch({ activeTab: "info" });
    dispatch({ userLogs: [] });
    dispatch({ watchHistory: null });
    watchPageRef.current = 1;
    dispatch({ watchAction: "all" });
    dispatch({ watchContentType: "all" });
    dispatch({ watchStartDate: "" });
    dispatch({ watchEndDate: "" });
    dispatch({ logFilter: "all" });
  };

  const closeEditModal = () => {
    dispatch({ editModal: { open: false, user: null } });
    dispatch({ editError: "" });
    dispatch({ editSaving: false });
    dispatch({ activeTab: "info" });
    dispatch({ userLogs: [] });
    dispatch({ watchHistory: null });
  };

  const handleUpdateUser = async () => {
    if (!editModal.user) return;

    const userName = editModal.user.name || editModal.user.email;

    dispatch({ editSaving: true });
    dispatch({ editError: "" });

    try {
      const payload: {
        name?: string;
        role?: UserRole;
        password?: string;
      } = {};

      if (editForm.name.trim()) {
        payload.name = editForm.name.trim();
      }

      payload.role = editForm.role;

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const response = await adminApi.put<User>(
        `/admin/users/${editModal.user.id}`,
        payload
      );

      if (response.success && response.data) {
        const updatedUser = response.data as User;

        dispatch((s) => ({
          users: s.users.map((u) =>
            u.id === updatedUser.id ? { ...u, ...updatedUser } : u
          ),
        }));
        closeEditModal();
        fetchUsers();
        showSuccess(
          "User updated",
          `User "${userName}" has been updated successfully`
        );
      } else {
        dispatch({ editError: response.error || "Failed to update user" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      dispatch({ editError: "Failed to update user" });
    } finally {
      dispatch({ editSaving: false });
    }
  };

  useEffect(() => {
    if (activeTab !== "watch" || !editModal.open || !editModal.user) return;
    fetchWatchHistory(editModal.user.id, watchPageRef.current);
  }, [activeTab, editModal.open, editModal.user, fetchWatchHistory]);

  return {
    state,
    users,
    loading,
    filter,
    banModal,
    banReason,
    editModal,
    editForm,
    editSaving,
    editError,
    activeTab,
    userLogs,
    logsLoading,
    logFilter,
    watchHistory,
    watchLoading,
    watchAction,
    watchContentType,
    watchStartDate,
    watchEndDate,
    roleOptions,
    fallbackPoster,
    dispatch,
    fetchUsers,
    handleBanUser,
    handleUnbanUser,
    fetchUserLogs,
    fetchWatchHistory,
    openEditModal,
    closeEditModal,
    handleUpdateUser,
    watchPageRef,
  };
}
