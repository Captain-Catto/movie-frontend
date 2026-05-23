import type {
  EditModalState,
  AdminUsersTab,
  EditFormState,
  UserRole,
  WatchHistoryResponse,
  WatchActionType,
  WatchContentType,
  UserLog,
} from "./types";
import AdminUserEditTabs from "./AdminUserEditTabs";
import AdminUserInfoTab from "./AdminUserInfoTab";
import AdminUserWatchTab from "./AdminUserWatchTab";
import AdminUserLogsTab from "./AdminUserLogsTab";

interface AdminUserEditModalProps {
  editModal: EditModalState;
  activeTab: AdminUsersTab;
  editForm: EditFormState;
  roleOptions: UserRole[];
  editError: string;
  editSaving: boolean;
  watchHistory: WatchHistoryResponse | null;
  watchLoading: boolean;
  watchAction: WatchActionType;
  watchContentType: WatchContentType;
  watchStartDate: string;
  watchEndDate: string;
  logFilter: string;
  logsLoading: boolean;
  userLogs: UserLog[];
  fallbackPoster: string;
  onClose: () => void;
  onSelectTab: (tab: AdminUsersTab) => void;
  onEditFormChange: (patch: Partial<EditFormState>) => void;
  onUpdateUser: () => void;
  onWatchActionChange: (value: WatchActionType) => void;
  onWatchContentTypeChange: (value: WatchContentType) => void;
  onWatchStartDateChange: (value: string) => void;
  onWatchEndDateChange: (value: string) => void;
  onRefreshWatchHistory: () => void;
  onWatchPageChange: (direction: "previous" | "next") => void;
  onLogFilterChange: (value: string) => void;
  onLoadLogs: () => void;
}

export default function AdminUserEditModal({
  editModal,
  activeTab,
  editForm,
  roleOptions,
  editError,
  editSaving,
  watchHistory,
  watchLoading,
  watchAction,
  watchContentType,
  watchStartDate,
  watchEndDate,
  logFilter,
  logsLoading,
  userLogs,
  fallbackPoster,
  onClose,
  onSelectTab,
  onEditFormChange,
  onUpdateUser,
  onWatchActionChange,
  onWatchContentTypeChange,
  onWatchStartDateChange,
  onWatchEndDateChange,
  onRefreshWatchHistory,
  onWatchPageChange,
  onLogFilterChange,
  onLoadLogs,
}: AdminUserEditModalProps) {
  if (!editModal.open || !editModal.user) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">User Details</h3>
            <p className="text-gray-400 text-sm">{editModal.user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <AdminUserEditTabs
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onLoadLogs={onLoadLogs}
        />

        {activeTab === "info" && (
          <AdminUserInfoTab
            user={editModal.user}
            editForm={editForm}
            roleOptions={roleOptions}
            editError={editError}
            editSaving={editSaving}
            onEditFormChange={onEditFormChange}
            onClose={onClose}
            onUpdateUser={onUpdateUser}
          />
        )}

        {activeTab === "watch" && (
          <AdminUserWatchTab
            watchHistory={watchHistory}
            watchLoading={watchLoading}
            watchAction={watchAction}
            watchContentType={watchContentType}
            watchStartDate={watchStartDate}
            watchEndDate={watchEndDate}
            fallbackPoster={fallbackPoster}
            onWatchActionChange={onWatchActionChange}
            onWatchContentTypeChange={onWatchContentTypeChange}
            onWatchStartDateChange={onWatchStartDateChange}
            onWatchEndDateChange={onWatchEndDateChange}
            onRefreshWatchHistory={onRefreshWatchHistory}
            onWatchPageChange={onWatchPageChange}
            onClose={onClose}
          />
        )}

        {activeTab === "logs" && (
          <AdminUserLogsTab
            logFilter={logFilter}
            logsLoading={logsLoading}
            userLogs={userLogs}
            onLogFilterChange={onLogFilterChange}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
