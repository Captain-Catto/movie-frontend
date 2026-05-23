"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
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
import {
  useAdminUserDetail,
  FILTER_OPTIONS,
  COMMENT_HIDE_REASONS,
  type UserDetails,
  type UserProfileForm,
  type ActivityStats,
  type ActivityItem,
  type HideCommentModalState,
  type WatchTimeSummaryItem,
  type WatchTimeSummaryResponse,
  type DetailModalType,
  type DetailItem,
  type CommentGroupPageState,
  type UserCommentGroupItem,
  type UserCommentEntry,
} from "@/hooks/useAdminUserDetail";

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

function countryCodeToFlag(code?: string | null) {
  if (!code || code.length !== 2) return null;
  const upper = code.toUpperCase();
  return upper
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

function AdminUserDetailBackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
    >
      <ArrowLeft className="size-4" />
      <span>Quay lại danh sách</span>
    </button>
  );
}

function AdminUserProfileHeader({ user }: { user: UserDetails }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-start gap-4">
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-white">{user.name || "Unnamed"}</h1>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
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
              Joined: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </span>
            {user.provider && <span>Provider: {user.provider}</span>}
            {user.lastLoginAt && (
              <span suppressHydrationWarning>
                Last login: {new Date(user.lastLoginAt).toLocaleString("vi-VN")}
              </span>
            )}
            {user.lastLoginCountry && (
              <span>
                {countryCodeToFlag(user.lastLoginCountry)} {user.lastLoginCountry}
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
  );
}

function AdminUserProfileCard({
  user,
  profileForm,
  isEditingSelf,
  savingProfile,
  onProfileFormChange,
  onSave,
}: {
  user: UserDetails;
  profileForm: UserProfileForm;
  isEditingSelf: boolean;
  savingProfile: boolean;
  onProfileFormChange: (patch: Partial<UserProfileForm>) => void;
  onSave: () => void;
}) {
  return (
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
          type="button"
          onClick={onSave}
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
            aria-label="User detail display name"
            value={profileForm.name}
            onChange={(event) => onProfileFormChange({ name: event.target.value })}
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
            aria-label="User detail email"
            value={user.email}
            readOnly
            className="w-full px-3 py-2 bg-gray-900/70 border border-gray-700 rounded-lg text-sm text-gray-300 cursor-not-allowed"
          />
        </label>

        <label htmlFor="user-detail-role" className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Quyền</span>
          <select
            id="user-detail-role"
            aria-label="User detail role"
            value={profileForm.role}
            disabled={isEditingSelf}
            onChange={(event) => onProfileFormChange({ role: event.target.value })}
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
            onChange={(event) => onProfileFormChange({ isActive: event.target.value === "active" })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </label>
      </div>
    </div>
  );
}

function AdminUserStatsGrid({
  displayStats,
  displayWatchTimeSeconds,
  onOpenDetailModal,
  onOpenWatchTime,
}: {
  displayStats: ActivityStats;
  displayWatchTimeSeconds: number;
  onOpenDetailModal: (type: DetailModalType) => void;
  onOpenWatchTime: () => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <StatCard
        icon={<Eye className="size-5 text-blue-400" />}
        label="Lượt xem"
        value={displayStats.views}
        onClick={() => onOpenDetailModal("views")}
      />
      <StatCard
        icon={<Search className="size-5 text-yellow-400" />}
        label="Tìm kiếm"
        value={displayStats.searches}
        onClick={() => onOpenDetailModal("searches")}
      />
      <StatCard
        icon={<Heart className="size-5 text-pink-400" />}
        label="Yêu thích"
        value={displayStats.favorites}
        onClick={() => onOpenDetailModal("favorites")}
      />
      <StatCard
        icon={<MessageSquare className="size-5 text-purple-400" />}
        label="Bình luận"
        value={displayStats.comments}
        onClick={() => onOpenDetailModal("comments")}
      />
      <StatCard
        icon={<Clock className="size-5 text-green-400" />}
        label="Thời gian xem"
        value={formatWatchTime(displayWatchTimeSeconds)}
        onClick={onOpenWatchTime}
      />
      <StatCard
        icon={<LogIn className="size-5 text-emerald-400" />}
        label="Đăng nhập"
        value={displayStats.logins}
        onClick={() => onOpenDetailModal("logins")}
      />
    </div>
  );
}

function AdminUserTimelineCard({
  total,
  selectedFilterLabel,
  showFilterMenu,
  filter,
  timeline,
  timelineLoading,
  page,
  totalPages,
  onToggleFilterMenu,
  onFilterChange,
  onLoadMore,
}: {
  total: number;
  selectedFilterLabel: string;
  showFilterMenu: boolean;
  filter: string;
  timeline: ActivityItem[];
  timelineLoading: boolean;
  page: number;
  totalPages: number;
  onToggleFilterMenu: () => void;
  onFilterChange: (value: string) => void;
  onLoadMore: () => void;
}) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">
          Lịch sử hoạt động
          <span className="text-sm font-normal text-gray-400 ml-2">({total} hoạt động)</span>
        </h2>

        <div className="relative">
          <button
            type="button"
            onClick={onToggleFilterMenu}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors cursor-pointer"
          >
            <Filter className="size-4" />
            {selectedFilterLabel}
            <ChevronDown className="size-3" />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg border border-gray-600 shadow-xl z-10 min-w-[150px]">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFilterChange(opt.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer ${
                    filter === opt.value ? "text-blue-400 bg-gray-600/50" : "text-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-700/50">
        {timeline.length === 0 && !timelineLoading && (
          <div className="text-center py-12 text-gray-500">Chưa có hoạt động nào</div>
        )}

        {timeline.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-4 hover:bg-gray-750/50 transition-colors"
          >
            <div
              className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(
                item.type
              )}`}
            >
              {getActivityIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-sm text-white">{item.description}</span>
                  {item.metadata?.duration && Number(item.metadata.duration) > 0 ? (
                    <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                      {formatDuration(Number(item.metadata.duration))}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap" suppressHydrationWarning>
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>

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
                  <span className="uppercase">{String(item.metadata.contentType)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {page < totalPages && (
        <div className="p-4 border-t border-gray-700 text-center">
          <button
            type="button"
            onClick={onLoadMore}
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
  );
}

function AdminHideCommentModal({
  modal,
  onReasonChange,
  onCustomReasonChange,
  onClose,
  onConfirm,
}: {
  modal: HideCommentModalState;
  onReasonChange: (value: string) => void;
  onCustomReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!modal.group || !modal.commentId) return null;

  return (
    <div className="fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Ẩn bình luận</h2>
            <p className="text-sm text-gray-400 mt-1">
              Người dùng bên ngoài sẽ thấy thông báo bình luận này bị ẩn bởi admin.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
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
            value={modal.reason}
            onChange={(event) => onReasonChange(event.target.value)}
            className="w-full rounded-lg bg-gray-950 border border-gray-700 text-white placeholder:text-gray-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {COMMENT_HIDE_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          {modal.reason === "Khác" && (
            <textarea
              value={modal.customReason}
              onChange={(event) => onCustomReasonChange(event.target.value)}
              rows={3}
              aria-label="Lý do cụ thể"
              placeholder="Nhập lý do cụ thể"
              className="w-full rounded-lg bg-gray-950 border border-gray-700 text-white placeholder:text-gray-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={modal.saving}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2"
          >
            {modal.saving && <Loader2 className="size-4 animate-spin" />}
            Ẩn bình luận
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminWatchTimeModal({
  open,
  loading,
  items,
  summary,
  page,
  totalPages,
  onClose,
  onPageChange,
}: {
  open: boolean;
  loading: boolean;
  items: WatchTimeSummaryItem[];
  summary: WatchTimeSummaryResponse["summary"] | null;
  page: number;
  totalPages: number;
  onClose: () => void;
  onPageChange: (page: number) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Chi tiết thời gian xem</h2>
            <p className="text-sm text-gray-400 mt-1">
              {summary
                ? `${summary.totalContent} phim/series - ${formatWatchTime(
                    summary.totalWatchTimeSeconds
                  )}`
                : "Tổng thời gian xem theo từng phim/series"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
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
            <div className="text-center py-16 text-gray-500">Chưa có dữ liệu thời gian xem</div>
          ) : (
            items.map((item) => (
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
                        Gần nhất: {new Date(item.lastWatchedAt).toLocaleString("vi-VN")}
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

export default function AdminUserDetailPage() {
  const { push } = useRouter();
  const {
    user,
    profileForm,
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
    handleFilterChange,
    handleLoadMore,
    handleOpenWatchTime,
    handleWatchTimePageChange,
    handleOpenDetailModal,
    handleDetailPageChange,
    handleToggleCommentGroup,
    handleCommentGroupPageChange,
    handleOpenHideCommentModal,
    handleHideComment,
    handleUnhideComment,
    handleSaveProfile,
  } = useAdminUserDetail();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-20 text-gray-400">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <AdminUserDetailBackButton onBack={() => push("/admin/users")} />
      <AdminUserProfileHeader user={user} />
      <AdminUserProfileCard
        user={user}
        profileForm={profileForm}
        isEditingSelf={isEditingSelf}
        savingProfile={savingProfile}
        onProfileFormChange={(patch) =>
          dispatch((s) => ({ profileForm: { ...s.profileForm, ...patch } }))
        }
        onSave={handleSaveProfile}
      />
      {displayStats && (
        <AdminUserStatsGrid
          displayStats={displayStats}
          displayWatchTimeSeconds={displayWatchTimeSeconds}
          onOpenDetailModal={handleOpenDetailModal}
          onOpenWatchTime={handleOpenWatchTime}
        />
      )}
      <AdminUserTimelineCard
        total={total}
        selectedFilterLabel={selectedFilter?.label || FILTER_OPTIONS[0].label}
        showFilterMenu={showFilterMenu}
        filter={filter}
        timeline={timeline}
        timelineLoading={timelineLoading}
        page={page}
        totalPages={totalPages}
        onToggleFilterMenu={() => dispatch({ showFilterMenu: !showFilterMenu })}
        onFilterChange={handleFilterChange}
        onLoadMore={handleLoadMore}
      />

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
          onClose={() => dispatch({ detailModalType: null })}
          onPageChange={handleDetailPageChange}
        />
      )}

      <AdminHideCommentModal
        modal={hideCommentModal}
        onReasonChange={(value) =>
          dispatch((s) => ({ hideCommentModal: { ...s.hideCommentModal, reason: value } }))
        }
        onCustomReasonChange={(value) =>
          dispatch((s) => ({
            hideCommentModal: { ...s.hideCommentModal, customReason: value },
          }))
        }
        onClose={() =>
          dispatch({
            hideCommentModal: {
              group: null,
              commentId: null,
              reason: COMMENT_HIDE_REASONS[0],
              customReason: "",
              saving: false,
            },
          })
        }
        onConfirm={handleHideComment}
      />
      <AdminWatchTimeModal
        open={watchTimeOpen}
        loading={watchTimeLoading}
        items={watchTimeItems}
        summary={watchTimeSummary}
        page={watchTimePage}
        totalPages={watchTimeTotalPages}
        onClose={() => dispatch({ watchTimeOpen: false })}
        onPageChange={handleWatchTimePageChange}
      />
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
        onClick ? "hover:bg-gray-750 hover:border-gray-600 cursor-pointer" : "cursor-default"
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
            <h2 className="text-lg font-semibold text-white">{titleByType[type]}</h2>
            <p className="text-sm text-gray-400 mt-1">{totalLabelByType[type]}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
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
            <div className="text-center py-16 text-gray-500">{emptyByType[type]}</div>
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
              <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-500">Đã ẩn</span>
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
            <p className="mt-2 text-xs text-gray-600 line-clamp-2">{item.userAgent}</p>
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
        meta={`Đã thêm yêu thích lúc ${new Date(item.createdAt).toLocaleString("vi-VN")}`}
        icon={<Heart className="size-5 text-pink-400" />}
      />
    );
  }

  if (type === "comments" && "comments" in item) {
    const isExpanded = expandedCommentGroups.has(item.id);
    const pageState = commentGroupPages[item.id];
    const visibleComments = isExpanded ? pageState?.data || item.comments : item.comments.slice(0, 1);

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
                  <span suppressHydrationWarning>
                    {new Date(comment.createdAt).toLocaleString("vi-VN")}
                  </span>
                  <span>{comment.likeCount} like</span>
                  <span>{comment.dislikeCount} dislike</span>
                  <span>{comment.replyCount} replies</span>
                  {comment.parentId && <span>Reply #{comment.parentId}</span>}
                  {comment.isHidden && <span className="text-yellow-400">Đã ẩn</span>}
                  {comment.isDeleted && <span className="text-red-400">Đã xoá</span>}
                </div>
                {!comment.isDeleted &&
                  (comment.isHidden ? (
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
                  ))}
              </div>
            </div>
          ))}
          {item.commentCount > 1 && (
            <button
              type="button"
              onClick={() => onToggleCommentGroup(item)}
              className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              {isExpanded ? "Thu gọn bình luận" : `Xem bình luận trong phim/series này`}
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
          <Image src={posterUrl} alt={title} fill sizes="48px" className="object-cover" />
        ) : (
          <div className="size-full flex items-center justify-center">{icon}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {href ? (
            <a href={href} className="font-medium text-white hover:text-blue-400 truncate">
              {title}
            </a>
          ) : (
            <span className="font-medium text-white truncate">{title}</span>
          )}
          <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400 uppercase">
            {contentType === "tv" ? "TV" : "Movie"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
          {meta}
        </p>
        {children}
      </div>
    </div>
  );
}
