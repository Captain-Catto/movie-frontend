"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminApi } from "@/hooks/useAdminApi";
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
  source: "user_activity" | "view_analytics";
}

interface TimelineResponse {
  data: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

function getActivityIcon(type: string) {
  const t = type.toUpperCase();
  if (t === "VIEW" || t === "VIEW_CONTENT") return <Eye className="w-4 h-4" />;
  if (t === "CLICK" || t === "CLICK_CONTENT")
    return <MousePointerClick className="w-4 h-4" />;
  if (t === "PLAY") return <Play className="w-4 h-4" />;
  if (t === "SEARCH") return <Search className="w-4 h-4" />;
  if (t.includes("FAVORITE")) return <Heart className="w-4 h-4" />;
  if (t.includes("COMMENT")) return <MessageSquare className="w-4 h-4" />;
  if (t === "LOGIN") return <LogIn className="w-4 h-4" />;
  return <Eye className="w-4 h-4" />;
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
  if (device === "mobile") return <Smartphone className="w-3 h-3" />;
  if (device === "tablet") return <Tablet className="w-3 h-3" />;
  return <Monitor className="w-3 h-3" />;
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
  const router = useRouter();
  const userId = params.id as string;
  const api = useAdminApi();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [timeline, setTimeline] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const fetchUser = useCallback(async () => {
    const res = await api.get<UserDetails>(`/admin/users/${userId}`);
    if (res.success && res.data) {
      setUser(res.data);
    }
  }, [api, userId]);

  const fetchStats = useCallback(async () => {
    const res = await api.get<ActivityStats>(
      `/admin/users/${userId}/activity-stats`
    );
    if (res.success && res.data) {
      setStats(res.data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin/users")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách</span>
      </button>

      {/* User Profile Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">
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
              <span>
                Joined:{" "}
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </span>
              {user.provider && <span>Provider: {user.provider}</span>}
              {user.lastLoginAt && (
                <span>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard
            icon={<Eye className="w-5 h-5 text-blue-400" />}
            label="Lượt xem"
            value={stats.views}
          />
          <StatCard
            icon={<Search className="w-5 h-5 text-yellow-400" />}
            label="Tìm kiếm"
            value={stats.searches}
          />
          <StatCard
            icon={<Heart className="w-5 h-5 text-pink-400" />}
            label="Yêu thích"
            value={stats.favorites}
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
            label="Bình luận"
            value={stats.comments}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-green-400" />}
            label="Thời gian xem"
            value={formatWatchTime(stats.watchTimeSeconds)}
          />
          <StatCard
            icon={<LogIn className="w-5 h-5 text-emerald-400" />}
            label="Đăng nhập"
            value={stats.logins}
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
              <Filter className="w-4 h-4" />
              {selectedFilter?.label}
              <ChevronDown className="w-3 h-3" />
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
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(
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
                  <span className="text-xs text-gray-500 whitespace-nowrap">
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
                  {item.metadata?.contentType && (
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải...
                </span>
              ) : (
                "Tải thêm"
              )}
            </button>
          </div>
        )}

        {timelineLoading && timeline.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
