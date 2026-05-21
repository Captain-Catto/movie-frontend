"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useToastRedux } from "@/hooks/useToastRedux";
import { useAuth } from "@/hooks/useAuth";
import { Pagination } from "@/components/ui/Pagination";
import {
  ArrowLeft,
  User as UserIcon,
  Eye,
  Search,
  Heart,
  Clock,
  MessageSquare,
  LogIn,
  Monitor,
  Smartphone,
  Tablet,
  MousePointerClick,
  Play,
  Filter,
  ChevronDown,
  Loader2,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

interface UserDetails {
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

interface ActivityStats {
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

interface ActivityItem {
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

interface TimelineResponse {
  data: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface WatchTimeSummaryItem {
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

interface WatchTimeSummaryResponse {
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

type DetailModalType = "views" | "searches" | "favorites" | "comments" | "logins";

interface UserSearchHistoryItem {
  id: number;
  query: string;
  type: "movie" | "tv" | "person" | "all";
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserFavoriteDetailItem {
  id: number;
  contentId: string;
  tmdbId: number | null;
  contentType: "movie" | "tv";
  contentTitle: string;
  posterUrl: string | null;
  href: string | null;
  createdAt: string;
}

interface UserViewHistoryItem {
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

interface UserCommentEntry {
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

interface UserCommentGroupItem {
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

interface UserLoginHistoryItem {
  id: string;
  source: "user_activity" | "user_logs";
  description: string;
  ipAddress: string | null;
  deviceType: string | null;
  country: string | null;
  userAgent: string | null;
  createdAt: string;
}

type DetailItem =
  | UserViewHistoryItem
  | UserSearchHistoryItem
  | UserFavoriteDetailItem
  | UserCommentGroupItem
  | UserLoginHistoryItem;

interface DetailResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  meta?: Record<string, unknown>;
}

interface CommentGroupPageState {
  data: UserCommentEntry[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
}

interface AdminUserDetailsResponse {
  user: UserDetails;
  activities?: ActivityItem[];
  stats?: ActivityStats;
}

interface UserProfileForm {
  name: string;
  role: string;
  isActive: boolean;
}

const FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "view", label: "Lượt xem" },
  { value: "click", label: "Lượt click" },
  { value: "play", label: "Phát phim" },
  { value: "search", label: "Tìm kiếm" },
  { value: "favorite", label: "Yêu thích" },
  { value: "comment", label: "Bình luận" },
  { value: "login", label: "Đăng nhập" },
];

const COMMENT_HIDE_REASONS = [
  "Nội dung không phù hợp",
  "Spam hoặc quảng cáo",
  "Ngôn từ xúc phạm/quấy rối",
  "Tiết lộ nội dung phim không cảnh báo",
  "Vi phạm quy định cộng đồng",
  "Khác",
];

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "viewer", label: "Viewer" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super admin" },
];

function getActivityIcon(type: string) {
  const t = type.toUpperCase();
  if (t === "VIEW" || t === "VIEW_CONTENT") return <Eye className="size-4" />;
  if (t === "CLICK" || t === "CLICK_CONTENT")
    return <MousePointerClick className="size-4" />;
  if (t === "PLAY") return <Play className="size-4" />;
  if (t === "SEARCH") return <Search className="size-4" />;
  if (t.includes("FAVORITE")) return <Heart className="size-4" />;
  if (t.includes("COMMENT")) return <MessageSquare className="size-4" />;
  if (t === "LOGIN") return <LogIn className="size-4" />;
  return <Eye className="size-4" />;
}

function getActivityColor(type: string) {
  const t = type.toUpperCase();
  if (t === "VIEW" || t === "VIEW_CONTENT") return "bg-blue-500/20 text-blue-400";
  if (t === "CLICK" || t === "CLICK_CONTENT") return "bg-cyan-500/20 text-cyan-400";
  if (t === "PLAY") return "bg-green-500/20 text-green-400";
  if (t === "SEARCH") return "bg-yellow-500/20 text-yellow-400";
  if (t.includes("FAVORITE")) return "bg-pink-500/20 text-pink-400";
  if (t.includes("COMMENT")) return "bg-purple-500/20 text-purple-400";
  if (t === "LOGIN") return "bg-emerald-500/20 text-emerald-400";
  return "bg-gray-500/20 text-gray-400";
}

function getDeviceIcon(device?: string) {
  if (device === "mobile") return <Smartphone className="size-3" />;
  if (device === "tablet") return <Tablet className="size-3" />;
  return <Monitor className="size-3" />;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatWatchTime(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h} giờ`;
}

function buildStatsFromTimeline(timeline: ActivityItem[]): ActivityStats {
  return timeline.reduce<ActivityStats>(
    (acc, item) => {
      const type = item.type.toUpperCase();
      const description = item.description.toUpperCase();

      acc.total += 1;

      if (type.includes("LOGIN") || description.includes("LOGGED IN")) {
        acc.logins += 1;
        const createdAt = new Date(item.createdAt).getTime();
        const currentLastLogin = acc.lastLogin
          ? new Date(acc.lastLogin).getTime()
          : 0;
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

function countryCodeToFlag(code?: string | null) {
  if (!code || code.length !== 2) return null;
  const upper = code.toUpperCase();
  return upper
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const { push } = useRouter();
  const userId = params.id as string;
  const api = useAdminApi();
  const { showSuccess, showError } = useToastRedux();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [profileForm, setProfileForm] = useState<UserProfileForm>({
    name: "",
    role: "user",
    isActive: true,
  });
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [timeline, setTimeline] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [watchTimeOpen, setWatchTimeOpen] = useState(false);
  const [watchTimeLoading, setWatchTimeLoading] = useState(false);
  const [watchTimeItems, setWatchTimeItems] = useState<WatchTimeSummaryItem[]>([]);
  const [watchTimeSummary, setWatchTimeSummary] =
    useState<WatchTimeSummaryResponse["summary"] | null>(null);
  const [watchTimePage, setWatchTimePage] = useState(1);
  const [watchTimeTotalPages, setWatchTimeTotalPages] = useState(0);
  const [detailModalType, setDetailModalType] =
    useState<DetailModalType | null>(null);
  const [detailItems, setDetailItems] = useState<DetailItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailPage, setDetailPage] = useState(1);
  const [detailTotalPages, setDetailTotalPages] = useState(0);
  const [detailTotal, setDetailTotal] = useState(0);
  const [expandedCommentGroups, setExpandedCommentGroups] = useState<Set<string>>(
    () => new Set()
  );
  const [commentGroupPages, setCommentGroupPages] = useState<
    Record<string, CommentGroupPageState>
  >({});
  const [hideCommentModal, setHideCommentModal] = useState<{
    group: UserCommentGroupItem | null;
    commentId: number | null;
    reason: string;
    customReason: string;
    saving: boolean;
  }>({
    group: null,
    commentId: null,
    reason: COMMENT_HIDE_REASONS[0],
    customReason: "",
    saving: false,
  });

  const fetchUser = useCallback(async () => {
    const res = await api.get<AdminUserDetailsResponse | UserDetails>(
      `/admin/users/${userId}`
    );
    if (res.success && res.data) {
      const payload = res.data;
      const details = "user" in payload ? payload.user : payload;

      setUser(details);
      setProfileForm({
        name: details.name || "",
        role: details.role || "user",
        isActive: details.isActive,
      });

      if ("stats" in payload && payload.stats) {
        setStats(payload.stats);
      }
    }
  }, [api, userId]);

  const fetchStats = useCallback(async () => {
    const [res, watchTimeRes] = await Promise.all([
      api.get<ActivityStats>(`/admin/users/${userId}/activity-stats`),
      api.get<WatchTimeSummaryResponse>(
        `/admin/users/${userId}/watch-time-summary?page=1&limit=1`
      ),
    ]);

    if (res.success && res.data) {
      setStats(res.data);
    }

    if (watchTimeRes.success && watchTimeRes.data) {
      setWatchTimeSummary(watchTimeRes.data.summary);
    }
  }, [api, userId]);

  const fetchTimeline = useCallback(
    async (pageNum = 1, filterType = filter, append = false) => {
      setTimelineLoading(true);
      const res = await api.get<TimelineResponse>(
        `/admin/users/${userId}/activity?type=${filterType}&page=${pageNum}&limit=20`
      );
      if (res.success && res.data) {
        if (append) {
          setTimeline((prev) => [...prev, ...res.data!.data]);
        } else {
          setTimeline(res.data.data);
        }
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
        setPage(pageNum);
      }
      setTimelineLoading(false);
    },
    [api, userId, filter]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchUser(), fetchStats(), fetchTimeline(1, filter)]);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setShowFilterMenu(false);
    fetchTimeline(1, value);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchTimeline(page + 1, filter, true);
    }
  };

  const fetchWatchTimeSummary = useCallback(
    async (pageNum = 1, append = false) => {
      setWatchTimeLoading(true);
      const res = await api.get<WatchTimeSummaryResponse>(
        `/admin/users/${userId}/watch-time-summary?page=${pageNum}&limit=20`
      );

      if (res.success && res.data) {
        setWatchTimeItems((prev) =>
          append ? [...prev, ...res.data!.data] : res.data!.data
        );
        setWatchTimeSummary(res.data.summary);
        setWatchTimePage(pageNum);
        setWatchTimeTotalPages(res.data.totalPages);
      } else {
        showError(
          "Load failed",
          res.error || "Không thể tải chi tiết thời gian xem"
        );
      }

      setWatchTimeLoading(false);
    },
    [api, showError, userId]
  );

  const handleOpenWatchTime = () => {
    setWatchTimeOpen(true);
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

      setDetailLoading(true);
      const res = await api.get<DetailResponse<DetailItem>>(
        `/admin/users/${userId}/${endpointByType[type]}${
          endpointByType[type].includes("?") ? "&" : "?"
        }page=${pageNum}&limit=20`
      );

      if (res.success && res.data) {
        setDetailItems(res.data.data);
        setDetailPage(pageNum);
        setDetailTotalPages(res.data.totalPages);
        setDetailTotal(res.data.total);
        setExpandedCommentGroups(new Set());
        setCommentGroupPages({});
      } else {
        showError(
          "Load failed",
          res.error || "Không thể tải chi tiết hoạt động"
        );
      }

      setDetailLoading(false);
    },
    [api, showError, userId]
  );

  const handleOpenDetailModal = (type: DetailModalType) => {
    setDetailModalType(type);
    setDetailItems([]);
    setDetailPage(1);
    setDetailTotalPages(0);
    setDetailTotal(0);
    setExpandedCommentGroups(new Set());
    setCommentGroupPages({});
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

      setCommentGroupPages((prev) => ({
        ...prev,
        [group.id]: {
          data: prev[group.id]?.data || group.comments,
          page: prev[group.id]?.page || 1,
          totalPages: prev[group.id]?.totalPages || 1,
          total: prev[group.id]?.total || group.commentCount,
          loading: true,
        },
      }));

      const res = await api.get<DetailResponse<UserCommentEntry>>(
        `/admin/users/${userId}/comments/${group.contentType}/${group.contentId}?page=${pageNum}&limit=5`
      );

      if (res.success && res.data) {
        setCommentGroupPages((prev) => ({
          ...prev,
          [group.id]: {
            data: res.data!.data,
            page: res.data!.page,
            totalPages: res.data!.totalPages,
            total: res.data!.total,
            loading: false,
          },
        }));
      } else {
        setCommentGroupPages((prev) => ({
          ...prev,
          [group.id]: {
            data: prev[group.id]?.data || group.comments,
            page: prev[group.id]?.page || 1,
            totalPages: prev[group.id]?.totalPages || 1,
            total: prev[group.id]?.total || group.commentCount,
            loading: false,
          },
        }));
        showError("Load failed", res.error || "Không thể tải bình luận");
      }
    },
    [api, showError, userId]
  );

  const handleToggleCommentGroup = (group: UserCommentGroupItem) => {
    setExpandedCommentGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group.id)) {
        next.delete(group.id);
      } else {
        next.add(group.id);
        fetchCommentGroupPage(group, 1);
      }
      return next;
    });
  };

  const handleCommentGroupPageChange = (
    group: UserCommentGroupItem,
    pageNum: number
  ) => {
    fetchCommentGroupPage(group, pageNum);
  };

  const markCommentHidden = (
    group: UserCommentGroupItem,
    commentId: number,
    isHidden: boolean,
    hiddenReason: string | null = null
  ) => {
    const hiddenByUser = isHidden && currentUser
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

    setCommentGroupPages((prev) => ({
      ...prev,
      [group.id]: {
        ...(prev[group.id] || {
          data: group.comments,
          page: 1,
          totalPages: 1,
          total: group.commentCount,
          loading: false,
        }),
        data: (prev[group.id]?.data || group.comments).map(applyHiddenState),
      },
    }));
    setDetailItems((prev) =>
      prev.map((item) => {
        if (!("comments" in item) || item.id !== group.id) return item;
        return {
          ...item,
          comments: item.comments.map(applyHiddenState),
        };
      })
    );
  };

  const handleOpenHideCommentModal = (
    group: UserCommentGroupItem,
    commentId: number
  ) => {
    setHideCommentModal({
      group,
      commentId,
      reason: COMMENT_HIDE_REASONS[0],
      customReason: "",
      saving: false,
    });
  };

  const handleHideComment = async () => {
    const { group, commentId, reason, customReason } = hideCommentModal;
    if (!group || !commentId) return;

    const finalReason =
      reason === "Khác"
        ? customReason.trim() || "Lý do khác"
        : reason;

    setHideCommentModal((prev) => ({ ...prev, saving: true }));
    const res = await api.put(`/admin/comments/${commentId}/hide`, {
      reason: finalReason,
    });

    if (!res.success) {
      setHideCommentModal((prev) => ({ ...prev, saving: false }));
      showError("Hide failed", res.error || "Không thể ẩn bình luận");
      return;
    }

    markCommentHidden(group, commentId, true, finalReason);
    setHideCommentModal({
      group: null,
      commentId: null,
      reason: COMMENT_HIDE_REASONS[0],
      customReason: "",
      saving: false,
    });
    showSuccess("Đã ẩn", "Bình luận đã được ẩn khỏi nội dung công khai");
  };

  const handleUnhideComment = async (
    group: UserCommentGroupItem,
    commentId: number
  ) => {
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

    setSavingProfile(true);
    try {
      const res = await api.put<UserDetails>(`/admin/users/${user.id}`, {
        name: profileForm.name.trim(),
        role: profileForm.role,
        isActive: profileForm.isActive,
      });

      if (res.success && res.data) {
        setUser(res.data);
        setProfileForm({
          name: res.data.name || "",
          role: res.data.role || "user",
          isActive: res.data.isActive,
        });
        showSuccess("User updated", "Thông tin và quyền user đã được cập nhật");
      } else {
        showError("Update failed", res.error || "Không thể cập nhật user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showError("Update failed", "Không thể cập nhật user");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-400">
        User not found
      </div>
    );
  }

  const selectedFilter = FILTER_OPTIONS.find((f) => f.value === filter);
  const isEditingSelf = Number(currentUser?.id) === user.id;
  const timelineStats = buildStatsFromTimeline(timeline);
  const displayStats = stats || (timelineStats.total > 0 ? timelineStats : null);
  const displayWatchTimeSeconds =
    watchTimeSummary?.totalWatchTimeSeconds && watchTimeSummary.totalWatchTimeSeconds > 0
      ? watchTimeSummary.totalWatchTimeSeconds
      : displayStats?.watchTimeSeconds || 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => push("/admin/users")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="size-4" />
        <span>Quay lại danh sách</span>
      </button>

      {/* User Profile Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative size-16 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User avatar"}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <UserIcon className="size-8 text-gray-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-white">
                {user.name || "Unnamed"}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  user.isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {user.isActive ? "Active" : "Banned"}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
              <span suppressHydrationWarning>
                Joined:{" "}
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </span>
              {user.provider && <span>Provider: {user.provider}</span>}
              {user.lastLoginAt && (
                <span suppressHydrationWarning>
                  Last login:{" "}
                  {new Date(user.lastLoginAt).toLocaleString("vi-VN")}
                </span>
              )}
              {user.lastLoginCountry && (
                <span>
                  {countryCodeToFlag(user.lastLoginCountry)}{" "}
                  {user.lastLoginCountry}
                </span>
              )}
              {user.lastLoginDevice && (
                <span className="flex items-center gap-1">
                  {getDeviceIcon(user.lastLoginDevice)}
                  {user.lastLoginDevice}
                </span>
              )}
              {user.lastLoginIp && <span>IP: {user.lastLoginIp}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Account and permissions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="size-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Thông tin & quyền user</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Kiểm tra thông tin tài khoản, trạng thái và role hiện tại.
              {isEditingSelf
                ? " Bạn không thể tự thay đổi quyền hoặc khóa tài khoản của chính mình."
                : ""}
            </p>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
          >
            {savingProfile ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Lưu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <label htmlFor="user-detail-display-name" className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Tên hiển thị
            </span>
            <input
              id="user-detail-display-name"
              value={profileForm.name}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="Unnamed"
            />
          </label>

          <label htmlFor="user-detail-email" className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Email
            </span>
            <input
              id="user-detail-email"
              value={user.email}
              readOnly
              className="w-full px-3 py-2 bg-gray-900/70 border border-gray-700 rounded-lg text-sm text-gray-300 cursor-not-allowed"
            />
          </label>

          <label htmlFor="user-detail-role" className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Quyền
            </span>
            <select
              id="user-detail-role"
              value={profileForm.role}
              disabled={isEditingSelf}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  role: event.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="user-detail-status" className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Trạng thái
            </span>
            <select
              id="user-detail-status"
              value={profileForm.isActive ? "active" : "banned"}
              disabled={isEditingSelf}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  isActive: event.target.value === "active",
                }))
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </label>
        </div>
      </div>

      {/* Stats Cards */}
      {displayStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard
            icon={<Eye className="size-5 text-blue-400" />}
            label="Lượt xem"
            value={displayStats.views}
            onClick={() => handleOpenDetailModal("views")}
          />
          <StatCard
            icon={<Search className="size-5 text-yellow-400" />}
            label="Tìm kiếm"
            value={displayStats.searches}
            onClick={() => handleOpenDetailModal("searches")}
          />
          <StatCard
            icon={<Heart className="size-5 text-pink-400" />}
            label="Yêu thích"
            value={displayStats.favorites}
            onClick={() => handleOpenDetailModal("favorites")}
          />
          <StatCard
            icon={<MessageSquare className="size-5 text-purple-400" />}
            label="Bình luận"
            value={displayStats.comments}
            onClick={() => handleOpenDetailModal("comments")}
          />
          <StatCard
            icon={<Clock className="size-5 text-green-400" />}
            label="Thời gian xem"
            value={formatWatchTime(displayWatchTimeSeconds)}
            onClick={handleOpenWatchTime}
          />
          <StatCard
            icon={<LogIn className="size-5 text-emerald-400" />}
            label="Đăng nhập"
            value={displayStats.logins}
            onClick={() => handleOpenDetailModal("logins")}
          />
        </div>
      )}

      {/* Activity Timeline */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        {/* Timeline Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Lịch sử hoạt động
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({total} hoạt động)
            </span>
          </h2>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors cursor-pointer"
            >
              <Filter className="size-4" />
              {selectedFilter?.label}
              <ChevronDown className="size-3" />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg border border-gray-600 shadow-xl z-10 min-w-[150px]">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilterChange(opt.value)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer ${
                      filter === opt.value
                        ? "text-blue-400 bg-gray-600/50"
                        : "text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="divide-y divide-gray-700/50">
          {timeline.length === 0 && !timelineLoading && (
            <div className="text-center py-12 text-gray-500">
              Chưa có hoạt động nào
            </div>
          )}

          {timeline.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-4 hover:bg-gray-750/50 transition-colors"
            >
              {/* Icon */}
              <div
                className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(
                  item.type
                )}`}
              >
                {getActivityIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm text-white">
                      {item.description}
                    </span>
                    {/* Duration badge */}
                    {item.metadata?.duration &&
                      Number(item.metadata.duration) > 0 ? (
                        <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                          {formatDuration(Number(item.metadata.duration))}
                        </span>
                      ) : null}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap" suppressHydrationWarning>
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {item.deviceType && (
                    <span className="flex items-center gap-1">
                      {getDeviceIcon(item.deviceType)}
                      {item.deviceType}
                    </span>
                  )}
                  {item.country && (
                    <span>
                      {countryCodeToFlag(item.country)} {item.country}
                    </span>
                  )}
                  {item.ipAddress && <span>IP: {item.ipAddress}</span>}
                  {Boolean(item.metadata?.contentType) && (
                    <span className="uppercase">
                      {String(item.metadata.contentType)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {page < totalPages && (
          <div className="p-4 border-t border-gray-700 text-center">
            <button
              onClick={handleLoadMore}
              disabled={timelineLoading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-gray-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {timelineLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải…
                </span>
              ) : (
                "Tải thêm"
              )}
            </button>
          </div>
        )}

        {timelineLoading && timeline.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {detailModalType && (
          <DetailModal
            type={detailModalType}
            total={detailTotal}
            items={detailItems}
            expandedCommentGroups={expandedCommentGroups}
            commentGroupPages={commentGroupPages}
            loading={detailLoading}
            page={detailPage}
            totalPages={detailTotalPages}
            onToggleCommentGroup={handleToggleCommentGroup}
            onCommentGroupPageChange={handleCommentGroupPageChange}
            onOpenHideCommentModal={handleOpenHideCommentModal}
            onUnhideComment={handleUnhideComment}
            onClose={() => setDetailModalType(null)}
            onPageChange={handleDetailPageChange}
          />
      )}

      {hideCommentModal.group && hideCommentModal.commentId && (
        <div className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Ẩn bình luận
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Người dùng bên ngoài sẽ thấy thông báo bình luận này bị ẩn bởi admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setHideCommentModal({
                    group: null,
                    commentId: null,
                    reason: COMMENT_HIDE_REASONS[0],
                    customReason: "",
                    saving: false,
                  })
                }
                className="size-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white inline-flex items-center justify-center cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <label htmlFor="hide-comment-reason" className="block text-sm font-medium text-gray-300">
                Lý do ẩn
              </label>
              <select
                id="hide-comment-reason"
                value={hideCommentModal.reason}
                onChange={(event) =>
                  setHideCommentModal((prev) => ({
                    ...prev,
                    reason: event.target.value,
                  }))
                }
                className="w-full rounded-lg bg-gray-950 border border-gray-700 text-white placeholder:text-gray-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {COMMENT_HIDE_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {hideCommentModal.reason === "Khác" && (
                <textarea
                  value={hideCommentModal.customReason}
                  onChange={(event) =>
                    setHideCommentModal((prev) => ({
                      ...prev,
                      customReason: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Nhập lý do cụ thể"
                  className="w-full rounded-lg bg-gray-950 border border-gray-700 text-white placeholder:text-gray-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-700">
              <button
                type="button"
                onClick={() =>
                  setHideCommentModal({
                    group: null,
                    commentId: null,
                    reason: COMMENT_HIDE_REASONS[0],
                    customReason: "",
                    saving: false,
                  })
                }
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleHideComment}
                disabled={hideCommentModal.saving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2"
              >
                {hideCommentModal.saving && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Ẩn bình luận
              </button>
            </div>
          </div>
        </div>
      )}

      {watchTimeOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Chi tiết thời gian xem
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {watchTimeSummary
                    ? `${watchTimeSummary.totalContent} phim/series - ${formatWatchTime(
                        watchTimeSummary.totalWatchTimeSeconds
                      )}`
                    : "Tổng thời gian xem theo từng phim/series"}
                </p>
              </div>
              <button
                onClick={() => setWatchTimeOpen(false)}
                className="size-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white inline-flex items-center justify-center cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-800">
              {watchTimeLoading && watchTimeItems.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="size-7 animate-spin text-blue-500" />
                </div>
              ) : watchTimeItems.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  Chưa có dữ liệu thời gian xem
                </div>
              ) : (
                watchTimeItems.map((item) => (
                  <div
                    key={`${item.contentType}-${item.contentId}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="relative w-12 h-[72px] bg-gray-800 rounded overflow-hidden flex-shrink-0">
                      {item.posterUrl ? (
                        <Image
                          src={item.posterUrl}
                          alt={item.contentTitle}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <Play className="size-5 text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={item.href || "#"}
                          className="font-medium text-white hover:text-blue-400 truncate"
                        >
                          {item.contentTitle}
                        </a>
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400 uppercase">
                          {item.contentType === "tv_series" ? "TV" : "Movie"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                        <span>{item.totalPlays} lượt play</span>
                        <span>{item.durationEvents} lần ghi thời lượng</span>
                        {item.lastWatchedAt && (
                          <span suppressHydrationWarning>
                            Gần nhất:{" "}
                            {new Date(item.lastWatchedAt).toLocaleString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-white">
                        {formatWatchTime(item.totalWatchTimeSeconds)}
                      </div>
                      <div className="text-xs text-gray-500">tổng thời gian</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {watchTimeTotalPages > 1 && (
              <div className="p-4 border-t border-gray-700 text-center">
                <Pagination
                  currentPage={watchTimePage}
                  totalPages={watchTimeTotalPages}
                  onPageChange={handleWatchTimePageChange}
                  showPages={5}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left bg-gray-800 rounded-xl p-4 border border-gray-700 ${
        onClick
          ? "hover:bg-gray-750 hover:border-gray-600 cursor-pointer"
          : "cursor-default"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </button>
  );
}

function DetailModal({
  type,
  total,
  items,
  expandedCommentGroups,
  commentGroupPages,
  loading,
  page,
  totalPages,
  onToggleCommentGroup,
  onCommentGroupPageChange,
  onOpenHideCommentModal,
  onUnhideComment,
  onClose,
  onPageChange,
}: {
  type: DetailModalType;
  total: number;
  items: DetailItem[];
  expandedCommentGroups: Set<string>;
  commentGroupPages: Record<string, CommentGroupPageState>;
  loading: boolean;
  page: number;
  totalPages: number;
  onToggleCommentGroup: (group: UserCommentGroupItem) => void;
  onCommentGroupPageChange: (group: UserCommentGroupItem, page: number) => void;
  onOpenHideCommentModal: (group: UserCommentGroupItem, commentId: number) => void;
  onUnhideComment: (group: UserCommentGroupItem, commentId: number) => void;
  onClose: () => void;
  onPageChange: (page: number) => void;
}) {
  const titleByType: Record<DetailModalType, string> = {
    views: "Lịch sử lượt xem",
    searches: "Lịch sử tìm kiếm",
    favorites: "Danh sách yêu thích",
    comments: "Bình luận của user",
    logins: "Lịch sử đăng nhập",
  };
  const emptyByType: Record<DetailModalType, string> = {
    views: "User chưa có lượt xem nội dung nào",
    searches: "User chưa có lịch sử tìm kiếm",
    favorites: "User chưa có nội dung yêu thích",
    comments: "User chưa có bình luận",
    logins: "User chưa có lịch sử đăng nhập",
  };
  const totalLabelByType: Record<DetailModalType, string> = {
    views: `${total} lượt mở trang phim/series`,
    searches: `${total} lượt tìm kiếm`,
    favorites: `${total} nội dung yêu thích`,
    comments: `${total} phim/series có bình luận`,
    logins: `${total} lần đăng nhập`,
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {titleByType[type]}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{totalLabelByType[type]}</p>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white inline-flex items-center justify-center cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-800">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-7 animate-spin text-blue-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              {emptyByType[type]}
            </div>
          ) : (
            items.map((item) => (
              <DetailModalItem
                key={`${type}-${item.id}`}
                type={type}
                item={item}
                expandedCommentGroups={expandedCommentGroups}
                commentGroupPages={commentGroupPages}
                onToggleCommentGroup={onToggleCommentGroup}
                onCommentGroupPageChange={onCommentGroupPageChange}
                onOpenHideCommentModal={onOpenHideCommentModal}
                onUnhideComment={onUnhideComment}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-700 text-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showPages={5}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DetailModalItem({
  type,
  item,
  expandedCommentGroups,
  commentGroupPages,
  onToggleCommentGroup,
  onCommentGroupPageChange,
  onOpenHideCommentModal,
  onUnhideComment,
}: {
  type: DetailModalType;
  item: DetailItem;
  expandedCommentGroups: Set<string>;
  commentGroupPages: Record<string, CommentGroupPageState>;
  onToggleCommentGroup: (group: UserCommentGroupItem) => void;
  onCommentGroupPageChange: (group: UserCommentGroupItem, page: number) => void;
  onOpenHideCommentModal: (group: UserCommentGroupItem, commentId: number) => void;
  onUnhideComment: (group: UserCommentGroupItem, commentId: number) => void;
}) {
  if (type === "views" && "actionType" in item) {
    return (
      <ContentDetailRow
        posterUrl={item.posterUrl}
        title={item.contentTitle}
        href={item.href}
        contentType={item.contentType === "tv_series" ? "tv" : "movie"}
        meta={`Mở trang lúc ${new Date(item.createdAt).toLocaleString("vi-VN")}`}
        icon={<Eye className="size-5 text-blue-400" />}
      >
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
          <span>ID: {item.contentId}</span>
          {item.deviceType && (
            <span className="flex items-center gap-1">
              {getDeviceIcon(item.deviceType)}
              {item.deviceType}
            </span>
          )}
          {item.country && (
            <span>
              {countryCodeToFlag(item.country)} {item.country}
            </span>
          )}
        </div>
      </ContentDetailRow>
    );
  }

  if (type === "searches" && "query" in item) {
    return (
      <div className="flex items-start gap-3 p-4 hover:bg-gray-800/60 transition-colors">
        <div className="size-10 rounded-lg bg-yellow-500/15 text-yellow-400 inline-flex items-center justify-center flex-shrink-0">
          <Search className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white">{item.query}</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400 uppercase">
              {item.type}
            </span>
            {item.dismissedAt && (
              <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-500">
                Đã ẩn
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2" suppressHydrationWarning>
            Tìm lúc {new Date(item.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
      </div>
    );
  }

  if (type === "logins" && "source" in item) {
    return (
      <div className="flex items-start gap-3 p-4 hover:bg-gray-800/60 transition-colors">
        <div className="size-10 rounded-lg bg-emerald-500/15 text-emerald-400 inline-flex items-center justify-center flex-shrink-0">
          <LogIn className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white">{item.description}</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400">
              {item.source === "user_logs" ? "Log" : "Activity"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2" suppressHydrationWarning>
            {new Date(item.createdAt).toLocaleString("vi-VN")}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
            {item.deviceType && (
              <span className="flex items-center gap-1">
                {getDeviceIcon(item.deviceType)}
                {item.deviceType}
              </span>
            )}
            {item.country && (
              <span>
                {countryCodeToFlag(item.country)} {item.country}
              </span>
            )}
            {item.ipAddress && <span>IP: {item.ipAddress}</span>}
          </div>
          {item.userAgent && (
            <p className="mt-2 text-xs text-gray-600 line-clamp-2">
              {item.userAgent}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "favorites" && "posterUrl" in item && "createdAt" in item) {
    return (
      <ContentDetailRow
        posterUrl={item.posterUrl}
        title={item.contentTitle}
        href={item.href}
        contentType={item.contentType === "tv" ? "tv" : "movie"}
        meta={`Đã thêm yêu thích lúc ${new Date(item.createdAt).toLocaleString(
          "vi-VN"
        )}`}
        icon={<Heart className="size-5 text-pink-400" />}
      />
    );
  }

  if (type === "comments" && "comments" in item) {
    const isExpanded = expandedCommentGroups.has(item.id);
    const pageState = commentGroupPages[item.id];
    const visibleComments = isExpanded
      ? pageState?.data || item.comments
      : item.comments.slice(0, 1);

    return (
      <ContentDetailRow
        posterUrl={item.posterUrl}
        title={item.contentTitle}
        href={item.href}
        contentType={item.contentType}
        meta={`${item.commentCount} bình luận - gần nhất ${new Date(
          item.latestCommentAt
        ).toLocaleString("vi-VN")}`}
        icon={<MessageSquare className="size-5 text-purple-400" />}
      >
        <div className="mt-3 space-y-3">
          {isExpanded && pageState?.loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="size-4 animate-spin" />
              Đang tải bình luận…
            </div>
          )}
          {visibleComments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg bg-gray-950/50 border border-gray-800 p-3"
            >
              <p className={`text-sm text-gray-300 ${isExpanded ? "" : "line-clamp-3"}`}>
                {comment.content}
              </p>
              {comment.isHidden && (
                <div className="mt-2 rounded-lg bg-gray-900 border border-gray-800 px-3 py-2 text-xs text-gray-400 space-y-1">
                  <p>
                    <span className="text-gray-500">Lý do ẩn:</span>{" "}
                    {comment.hiddenReason || "Không có lý do"}
                  </p>
                  <p>
                    <span className="text-gray-500">Ẩn bởi:</span>{" "}
                    {comment.hiddenByUser
                      ? `${comment.hiddenByUser.name} (${comment.hiddenByUser.email})`
                      : comment.hiddenBy
                        ? `Admin #${comment.hiddenBy}`
                        : "Không rõ"}
                  </p>
                </div>
              )}
              <div className="flex items-start justify-between gap-3 mt-2">
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  <span suppressHydrationWarning>{new Date(comment.createdAt).toLocaleString("vi-VN")}</span>
                  <span>{comment.likeCount} like</span>
                  <span>{comment.dislikeCount} dislike</span>
                  <span>{comment.replyCount} replies</span>
                  {comment.parentId && <span>Reply #{comment.parentId}</span>}
                  {comment.isHidden && (
                    <span className="text-yellow-400">Đã ẩn</span>
                  )}
                  {comment.isDeleted && (
                    <span className="text-red-400">Đã xoá</span>
                  )}
                </div>
                {!comment.isDeleted && (
                  comment.isHidden ? (
                    <button
                      type="button"
                      onClick={() => onUnhideComment(item, comment.id)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 whitespace-nowrap cursor-pointer"
                    >
                      Mở lại
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenHideCommentModal(item, comment.id)}
                      className="text-xs text-red-400 hover:text-red-300 whitespace-nowrap cursor-pointer"
                    >
                      Ẩn bình luận
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
          {item.commentCount > 1 && (
            <button
              type="button"
              onClick={() => onToggleCommentGroup(item)}
              className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              {isExpanded
                ? "Thu gọn bình luận"
                : `Xem bình luận trong phim/series này`}
            </button>
          )}
          {isExpanded && pageState && pageState.totalPages > 1 && (
            <Pagination
              currentPage={pageState.page}
              totalPages={pageState.totalPages}
              onPageChange={(nextPage) => onCommentGroupPageChange(item, nextPage)}
              showPages={3}
              className="pt-2"
            />
          )}
        </div>
      </ContentDetailRow>
    );
  }

  return null;
}

function ContentDetailRow({
  posterUrl,
  title,
  href,
  contentType,
  meta,
  icon,
  children,
}: {
  posterUrl: string | null;
  title: string;
  href: string | null;
  contentType: "movie" | "tv";
  meta: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-800/60 transition-colors">
      <div className="relative w-12 h-[72px] bg-gray-800 rounded overflow-hidden flex-shrink-0">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {href ? (
            <a
              href={href}
              className="font-medium text-white hover:text-blue-400 truncate"
            >
              {title}
            </a>
          ) : (
            <span className="font-medium text-white truncate">{title}</span>
          )}
          <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400 uppercase">
            {contentType === "tv" ? "TV" : "Movie"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>{meta}</p>
        {children}
      </div>
    </div>
  );
}
