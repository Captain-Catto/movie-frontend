import { useEffect, useReducer, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToastRedux } from "@/hooks/useToastRedux";
import { useAuth } from "@/hooks/useAuth";

export interface UserDetails {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  provider?: string;
  image?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  lastLoginCountry?: string | null;
  totalWatchTime?: number;
}

export interface ActivityStats {
  total: number;
  logins: number;
  searches: number;
  views: number;
  favorites: number;
  comments: number;
  plays: number;
  watchTimeSeconds: number;
  lastLogin: string | null;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  deviceType?: string;
  country?: string;
  createdAt: string;
  source: "user_activity" | "user_logs" | "recent_searches" | "view_analytics";
}

export interface TimelineResponse {
  data: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WatchTimeSummaryItem {
  contentId: string;
  tmdbId: number | null;
  contentType: "movie" | "tv_series";
  contentTitle: string;
  totalWatchTimeSeconds: number;
  durationEvents: number;
  totalPlays: number;
  lastWatchedAt: string | null;
  posterUrl: string | null;
  href: string | null;
}

export interface WatchTimeSummaryResponse {
  data: WatchTimeSummaryItem[];
  summary: {
    totalContent: number;
    totalWatchTimeSeconds: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DetailModalType = "views" | "searches" | "favorites" | "comments" | "logins";

export interface UserSearchHistoryItem {
  id: number;
  query: string;
  type: "movie" | "tv" | "person" | "all";
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFavoriteDetailItem {
  id: number;
  contentId: string;
  tmdbId: number | null;
  contentType: "movie" | "tv";
  contentTitle: string;
  posterUrl: string | null;
  href: string | null;
  createdAt: string;
}

export interface UserViewHistoryItem {
  id: number;
  contentId: string;
  tmdbId: number | null;
  contentType: "movie" | "tv_series";
  actionType: "view" | "play" | "complete" | "click" | "search";
  contentTitle: string;
  duration: number;
  deviceType: string | null;
  country: string | null;
  createdAt: string;
  posterUrl: string | null;
  href: string | null;
}

export interface UserCommentEntry {
  id: number;
  content: string;
  parentId: number | null;
  isHidden: boolean;
  hiddenReason: string | null;
  hiddenBy: number | null;
  hiddenByUser: {
    id: number;
    name: string;
    email: string;
  } | null;
  isDeleted: boolean;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCommentGroupItem {
  id: string;
  contentId: number | null;
  contentType: "movie" | "tv";
  contentTitle: string;
  commentCount: number;
  latestCommentAt: string;
  posterUrl: string | null;
  href: string | null;
  comments: UserCommentEntry[];
}

export interface UserLoginHistoryItem {
  id: string;
  source: "user_activity" | "user_logs";
  description: string;
  ipAddress: string | null;
  deviceType: string | null;
  country: string | null;
  userAgent: string | null;
  createdAt: string;
}

export type DetailItem =
  | UserViewHistoryItem
  | UserSearchHistoryItem
  | UserFavoriteDetailItem
  | UserCommentGroupItem
  | UserLoginHistoryItem;

export interface DetailResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta?: Record<string, unknown>;
}

export interface CommentGroupPageState {
  data: UserCommentEntry[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
}

export interface AdminUserDetailsResponse {
  user: UserDetails;
  activities?: ActivityItem[];
  stats?: ActivityStats;
}

export interface UserProfileForm {
  name: string;
  role: string;
  isActive: boolean;
}

export interface HideCommentModalState {
  group: UserCommentGroupItem | null;
  commentId: number | null;
  reason: string;
  customReason: string;
  saving: boolean;
}

export const FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "view", label: "Lượt xem" },
  { value: "click", label: "Lượt click" },
  { value: "play", label: "Phát phim" },
  { value: "search", label: "Tìm kiếm" },
  { value: "favorite", label: "Yêu thích" },
  { value: "comment", label: "Bình luận" },
  { value: "login", label: "Đăng nhập" },
];

export const COMMENT_HIDE_REASONS = [
  "Nội dung không phù hợp",
  "Spam hoặc quảng cáo",
  "Ngôn từ xúc phạm/quấy rối",
  "Tiết lộ nội dung phim không cảnh báo",
  "Vi phạm quy định cộng đồng",
  "Khác",
];

function buildStatsFromTimeline(timeline: ActivityItem[]): ActivityStats {
  return timeline.reduce<ActivityStats>(
    (acc, item) => {
      const type = item.type.toUpperCase();
      const description = item.description.toUpperCase();

      acc.total += 1;

      if (type.includes("LOGIN") || description.includes("LOGGED IN")) {
        acc.logins += 1;
        const createdAt = new Date(item.createdAt).getTime();
        const currentLastLogin = acc.lastLogin ? new Date(acc.lastLogin).getTime() : 0;
        if (createdAt > currentLastLogin) {
          acc.lastLogin = item.createdAt;
        }
      }

      if (type.includes("SEARCH") || description.includes("SEARCHED")) {
        acc.searches += 1;
      }

      if (
        type === "VIEW" ||
        type.includes("VIEW") ||
        type.includes("WATCH") ||
        description.includes("WATCHED")
      ) {
        acc.views += 1;
      }

      if (type.includes("FAVORITE") || description.includes("FAVORITES")) {
        acc.favorites += 1;
      }

      if (type.includes("COMMENT") || description.includes("COMMENT")) {
        acc.comments += 1;
      }

      if (type === "PLAY" || type.includes("PLAY") || description.includes("PLAYED")) {
        acc.plays += 1;
      }

      const duration = Number(item.metadata?.duration || 0);
      if (duration > 0) {
        acc.watchTimeSeconds += duration;
      }

      return acc;
    },
    {
      total: 0,
      logins: 0,
      searches: 0,
      views: 0,
      favorites: 0,
      comments: 0,
      plays: 0,
      watchTimeSeconds: 0,
      lastLogin: null,
    }
  );
}

export function useAdminUserDetail() {
  const params = useParams();
  const userId = params.id as string;
  const api = useAdminApi();
  const { showSuccess, showError } = useToastRedux();
  const { user: currentUser } = useAuth();

  type PageState = {
    user: UserDetails | null;
    profileForm: UserProfileForm;
    stats: ActivityStats | null;
    timeline: ActivityItem[];
    loading: boolean;
    savingProfile: boolean;
    timelineLoading: boolean;
    filter: string;
    page: number;
    totalPages: number;
    total: number;
    showFilterMenu: boolean;
    watchTimeOpen: boolean;
    watchTimeLoading: boolean;
    watchTimeItems: WatchTimeSummaryItem[];
    watchTimeSummary: WatchTimeSummaryResponse["summary"] | null;
    watchTimePage: number;
    watchTimeTotalPages: number;
    detailModalType: DetailModalType | null;
    detailItems: DetailItem[];
    detailLoading: boolean;
    detailPage: number;
    detailTotalPages: number;
    detailTotal: number;
    expandedCommentGroups: Set<string>;
    commentGroupPages: Record<string, CommentGroupPageState>;
    hideCommentModal: HideCommentModalState;
  };

  type PageAction = Partial<PageState> | ((s: PageState) => Partial<PageState>);

  const [state, dispatch] = useReducer(
    (s: PageState, a: PageAction): PageState => {
      const patch = typeof a === "function" ? a(s) : a;
      return { ...s, ...patch };
    },
    {
      user: null,
      profileForm: { name: "", role: "user", isActive: true },
      stats: null,
      timeline: [],
      loading: true,
      savingProfile: false,
      timelineLoading: false,
      filter: "all",
      page: 1,
      totalPages: 0,
      total: 0,
      showFilterMenu: false,
      watchTimeOpen: false,
      watchTimeLoading: false,
      watchTimeItems: [],
      watchTimeSummary: null,
      watchTimePage: 1,
      watchTimeTotalPages: 0,
      detailModalType: null,
      detailItems: [],
      detailLoading: false,
      detailPage: 1,
      detailTotalPages: 0,
      detailTotal: 0,
      expandedCommentGroups: new Set<string>(),
      commentGroupPages: {},
      hideCommentModal: {
        group: null,
        commentId: null,
        reason: COMMENT_HIDE_REASONS[0],
        customReason: "",
        saving: false,
      },
    }
  );

  const {
    user,
    profileForm,
    stats,
    timeline,
    loading,
    savingProfile,
    timelineLoading,
    filter,
    page,
    totalPages,
    total,
    showFilterMenu,
    watchTimeOpen,
    watchTimeLoading,
    watchTimeItems,
    watchTimeSummary,
    watchTimePage,
    watchTimeTotalPages,
    detailModalType,
    detailItems,
    detailLoading,
    detailPage,
    detailTotalPages,
    detailTotal,
    expandedCommentGroups,
    commentGroupPages,
    hideCommentModal,
  } = state;

  const fetchUser = useCallback(async () => {
    const res = await api.get<AdminUserDetailsResponse | UserDetails>(`/admin/users/${userId}`);
    if (res.success && res.data) {
      const payload = res.data;
      const details = "user" in payload ? payload.user : payload;

      dispatch({
        user: details,
        profileForm: {
          name: details.name || "",
          role: details.role || "user",
          isActive: details.isActive,
        },
      });

      if ("stats" in payload && payload.stats) {
        dispatch({ stats: payload.stats });
      }
    }
  }, [api, userId]);

  const fetchStats = useCallback(async () => {
    const [res, watchTimeRes] = await Promise.all([
      api.get<ActivityStats>(`/admin/users/${userId}/activity-stats`),
      api.get<WatchTimeSummaryResponse>(`/admin/users/${userId}/watch-time-summary?page=1&limit=1`),
    ]);

    if (res.success && res.data) {
      dispatch({ stats: res.data });
    }

    if (watchTimeRes.success && watchTimeRes.data) {
      dispatch({ watchTimeSummary: watchTimeRes.data.summary });
    }
  }, [api, userId]);

  const fetchTimeline = useCallback(
    async (pageNum = 1, filterType: string, append = false) => {
      dispatch({ timelineLoading: true });
      const res = await api.get<TimelineResponse>(
        `/admin/users/${userId}/activity?type=${filterType}&page=${pageNum}&limit=20`
      );
      if (res.success && res.data) {
        if (append) {
          dispatch((s) => ({ timeline: [...s.timeline, ...res.data!.data] }));
        } else {
          dispatch({ timeline: res.data.data });
        }
        dispatch({ totalPages: res.data.totalPages });
        dispatch({ total: res.data.total });
        dispatch({ page: pageNum });
      }
      dispatch({ timelineLoading: false });
    },
    [api, userId]
  );

  useEffect(() => {
    const load = async () => {
      dispatch({ loading: true });
      await Promise.all([fetchUser(), fetchStats()]);
      dispatch({ loading: false });
    };
    load();
  }, [fetchUser, fetchStats]);

  useEffect(() => {
    fetchTimeline(1, filter);
  }, [fetchTimeline, filter]);

  const handleFilterChange = (value: string) => {
    dispatch({ filter: value });
    dispatch({ showFilterMenu: false });
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchTimeline(page + 1, filter, true);
    }
  };

  const fetchWatchTimeSummary = useCallback(
    async (pageNum = 1, append = false) => {
      dispatch({ watchTimeLoading: true });
      const res = await api.get<WatchTimeSummaryResponse>(
        `/admin/users/${userId}/watch-time-summary?page=${pageNum}&limit=20`
      );

      if (res.success && res.data) {
        dispatch((s) => ({
          watchTimeItems: append ? [...s.watchTimeItems, ...res.data!.data] : res.data!.data,
        }));
        dispatch({ watchTimeSummary: res.data.summary });
        dispatch({ watchTimePage: pageNum });
        dispatch({ watchTimeTotalPages: res.data.totalPages });
      } else {
        showError("Load failed", res.error || "Không thể tải chi tiết thời gian xem");
      }

      dispatch({ watchTimeLoading: false });
    },
    [api, showError, userId]
  );

  const handleOpenWatchTime = () => {
    dispatch({ watchTimeOpen: true });
    fetchWatchTimeSummary(1);
  };

  const handleWatchTimePageChange = (nextPage: number) => {
    fetchWatchTimeSummary(nextPage, false);
  };

  const fetchDetailItems = useCallback(
    async (type: DetailModalType, pageNum = 1) => {
      const endpointByType: Record<DetailModalType, string> = {
        views: "watch-history?actionType=view",
        searches: "search-history",
        favorites: "favorites",
        comments: "comments",
        logins: "login-history",
      };

      dispatch({ detailLoading: true });
      const res = await api.get<DetailResponse<DetailItem>>(
        `/admin/users/${userId}/${endpointByType[type]}${
          endpointByType[type].includes("?") ? "&" : "?"
        }page=${pageNum}&limit=20`
      );

      if (res.success && res.data) {
        dispatch({ detailItems: res.data.data });
        dispatch({ detailPage: pageNum });
        dispatch({ detailTotalPages: res.data.totalPages });
        dispatch({ detailTotal: res.data.total });
        dispatch({ expandedCommentGroups: new Set() });
        dispatch({ commentGroupPages: {} });
      } else {
        showError("Load failed", res.error || "Không thể tải chi tiết hoạt động");
      }

      dispatch({ detailLoading: false });
    },
    [api, showError, userId]
  );

  const handleOpenDetailModal = (type: DetailModalType) => {
    dispatch({ detailModalType: type });
    dispatch({ detailItems: [] });
    dispatch({ detailPage: 1 });
    dispatch({ detailTotalPages: 0 });
    dispatch({ detailTotal: 0 });
    dispatch({ expandedCommentGroups: new Set() });
    dispatch({ commentGroupPages: {} });
    fetchDetailItems(type, 1);
  };

  const handleDetailPageChange = (nextPage: number) => {
    if (detailModalType) {
      fetchDetailItems(detailModalType, nextPage);
    }
  };

  const fetchCommentGroupPage = useCallback(
    async (group: UserCommentGroupItem, pageNum = 1) => {
      if (!group.contentId) return;

      dispatch((s) => ({
        commentGroupPages: {
          ...s.commentGroupPages,
          [group.id]: {
            data: s.commentGroupPages[group.id]?.data || group.comments,
            page: s.commentGroupPages[group.id]?.page || 1,
            totalPages: s.commentGroupPages[group.id]?.totalPages || 1,
            total: s.commentGroupPages[group.id]?.total || group.commentCount,
            loading: true,
          },
        },
      }));

      const res = await api.get<DetailResponse<UserCommentEntry>>(
        `/admin/users/${userId}/comments/${group.contentType}/${group.contentId}?page=${pageNum}&limit=5`
      );

      if (res.success && res.data) {
        dispatch((s) => ({
          commentGroupPages: {
            ...s.commentGroupPages,
            [group.id]: {
              data: res.data!.data,
              page: res.data!.page,
              totalPages: res.data!.totalPages,
              total: res.data!.total,
              loading: false,
            },
          },
        }));
      } else {
        dispatch((s) => ({
          commentGroupPages: {
            ...s.commentGroupPages,
            [group.id]: {
              data: s.commentGroupPages[group.id]?.data || group.comments,
              page: s.commentGroupPages[group.id]?.page || 1,
              totalPages: s.commentGroupPages[group.id]?.totalPages || 1,
              total: s.commentGroupPages[group.id]?.total || group.commentCount,
              loading: false,
            },
          },
        }));
        showError("Load failed", res.error || "Không thể tải bình luận");
      }
    },
    [api, showError, userId]
  );

  const handleToggleCommentGroup = (group: UserCommentGroupItem) => {
    dispatch((s) => {
      const next = new Set(s.expandedCommentGroups);
      if (next.has(group.id)) {
        next.delete(group.id);
      } else {
        next.add(group.id);
        fetchCommentGroupPage(group, 1);
      }
      return { expandedCommentGroups: next };
    });
  };

  const handleCommentGroupPageChange = (group: UserCommentGroupItem, pageNum: number) => {
    fetchCommentGroupPage(group, pageNum);
  };

  const markCommentHidden = (
    group: UserCommentGroupItem,
    commentId: number,
    isHidden: boolean,
    hiddenReason: string | null = null
  ) => {
    const hiddenByUser =
      isHidden && currentUser
        ? {
            id: Number(currentUser.id),
            name: currentUser.name || currentUser.email || "Admin",
            email: currentUser.email || "",
          }
        : null;

    const applyHiddenState = (comment: UserCommentEntry) =>
      comment.id === commentId
        ? {
            ...comment,
            isHidden,
            hiddenReason: isHidden ? hiddenReason : null,
            hiddenBy: isHidden ? Number(currentUser?.id) || null : null,
            hiddenByUser,
          }
        : comment;

    dispatch((s) => ({
      commentGroupPages: {
        ...s.commentGroupPages,
        [group.id]: {
          ...(s.commentGroupPages[group.id] || {
            data: group.comments,
            page: 1,
            totalPages: 1,
            total: group.commentCount,
            loading: false,
          }),
          data: (s.commentGroupPages[group.id]?.data || group.comments).map(applyHiddenState),
        },
      },
    }));
    dispatch((s) => ({
      detailItems: s.detailItems.map((item) => {
        if (!("comments" in item) || item.id !== group.id) return item;
        return {
          ...item,
          comments: (item as UserCommentGroupItem).comments.map(applyHiddenState),
        };
      }),
    }));
  };

  const handleOpenHideCommentModal = (group: UserCommentGroupItem, commentId: number) => {
    dispatch({
      hideCommentModal: {
        group,
        commentId,
        reason: COMMENT_HIDE_REASONS[0],
        customReason: "",
        saving: false,
      },
    });
  };

  const handleHideComment = async () => {
    const { group, commentId, reason, customReason } = hideCommentModal;
    if (!group || !commentId) return;

    const finalReason = reason === "Khác" ? customReason.trim() || "Lý do khác" : reason;

    dispatch((s) => ({ hideCommentModal: { ...s.hideCommentModal, saving: true } }));
    const res = await api.put(`/admin/comments/${commentId}/hide`, {
      reason: finalReason,
    });

    if (!res.success) {
      dispatch((s) => ({ hideCommentModal: { ...s.hideCommentModal, saving: false } }));
      showError("Hide failed", res.error || "Không thể ẩn bình luận");
      return;
    }

    markCommentHidden(group, commentId, true, finalReason);
    dispatch({
      hideCommentModal: {
        group: null,
        commentId: null,
        reason: COMMENT_HIDE_REASONS[0],
        customReason: "",
        saving: false,
      },
    });
    showSuccess("Đã ẩn", "Bình luận đã được ẩn khỏi nội dung công khai");
  };

  const handleUnhideComment = async (group: UserCommentGroupItem, commentId: number) => {
    const res = await api.put(`/admin/comments/${commentId}/unhide`, {});
    if (!res.success) {
      showError("Unhide failed", res.error || "Không thể mở lại bình luận");
      return;
    }

    markCommentHidden(group, commentId, false);
    showSuccess("Đã mở lại", "Bình luận đã hiển thị lại ở trang công khai");
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const isEditingSelf = Number(currentUser?.id) === user.id;
    if (isEditingSelf && profileForm.role !== user.role) {
      showError("Không thể cập nhật", "Bạn không thể tự thay đổi quyền của chính mình");
      return;
    }

    if (isEditingSelf && !profileForm.isActive) {
      showError("Không thể cập nhật", "Bạn không thể tự khóa tài khoản của chính mình");
      return;
    }

    dispatch({ savingProfile: true });
    try {
      const res = await api.put<UserDetails>(`/admin/users/${user.id}`, {
        name: profileForm.name.trim(),
        role: profileForm.role,
        isActive: profileForm.isActive,
      });

      if (res.success && res.data) {
        dispatch({ user: res.data });
        dispatch({
          profileForm: {
            name: res.data.name || "",
            role: res.data.role || "user",
            isActive: res.data.isActive,
          },
        });
        showSuccess("User updated", "Thông tin và quyền user đã được cập nhật");
      } else {
        showError("Update failed", res.error || "Không thể cập nhật user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showError("Update failed", "Không thể cập nhật user");
    } finally {
      dispatch({ savingProfile: false });
    }
  };

  const selectedFilter = FILTER_OPTIONS.find((f) => f.value === filter);
  const isEditingSelf = Number(currentUser?.id) === user?.id;
  const timelineStats = buildStatsFromTimeline(timeline);
  const displayStats = stats || (timelineStats.total > 0 ? timelineStats : null);
  const displayWatchTimeSeconds =
    watchTimeSummary?.totalWatchTimeSeconds && watchTimeSummary.totalWatchTimeSeconds > 0
      ? watchTimeSummary.totalWatchTimeSeconds
      : displayStats?.watchTimeSeconds || 0;

  return {
    userId,
    user,
    profileForm,
    stats,
    timeline,
    loading,
    savingProfile,
    timelineLoading,
    filter,
    page,
    totalPages,
    total,
    showFilterMenu,
    watchTimeOpen,
    watchTimeLoading,
    watchTimeItems,
    watchTimeSummary,
    watchTimePage,
    watchTimeTotalPages,
    detailModalType,
    detailItems,
    detailLoading,
    detailPage,
    detailTotalPages,
    detailTotal,
    expandedCommentGroups,
    commentGroupPages,
    hideCommentModal,
    selectedFilter,
    isEditingSelf,
    displayStats,
    displayWatchTimeSeconds,
    dispatch,
    fetchUser,
    fetchStats,
    fetchTimeline,
    handleFilterChange,
    handleLoadMore,
    fetchWatchTimeSummary,
    handleOpenWatchTime,
    handleWatchTimePageChange,
    fetchDetailItems,
    handleOpenDetailModal,
    handleDetailPageChange,
    fetchCommentGroupPage,
    handleToggleCommentGroup,
    handleCommentGroupPageChange,
    handleOpenHideCommentModal,
    handleHideComment,
    handleUnhideComment,
    handleSaveProfile,
  };
}
