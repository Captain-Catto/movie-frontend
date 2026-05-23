"use client";

import { useRouter } from "next/navigation";
import { useAdminUsers } from "@/hooks/useAdminUsers";

// Import modular components
import AdminUsersHeader from "@/components/admin/users/AdminUsersHeader";
import AdminUsersFilterBar from "@/components/admin/users/AdminUsersFilterBar";
import AdminUsersTable from "@/components/admin/users/AdminUsersTable";
import AdminUserEditModal from "@/components/admin/users/AdminUserEditModal";
import AdminUsersBanModal from "@/components/admin/users/AdminUsersBanModal";

export default function AdminUsersPage() {
  const { push } = useRouter();
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
    roleOptions,
    fallbackPoster,
    dispatch,
    handleBanUser,
    handleUnbanUser,
    fetchUserLogs,
    fetchWatchHistory,
    openEditModal,
    closeEditModal,
    handleUpdateUser,
    watchPageRef,
  } = useAdminUsers();

  return (
    <div className="gap-y-6">
      <AdminUsersHeader />
      <AdminUsersFilterBar
        filter={filter}
        onFilterChange={(nextFilter) => dispatch({ filter: nextFilter })}
      />
      <AdminUsersTable
        users={users}
        loading={loading}
        onEditUser={openEditModal}
        onViewDetails={(userId) => push(`/admin/users/${userId}`)}
        onOpenBan={(user) => dispatch({ banModal: { open: true, user } })}
        onUnban={handleUnbanUser}
      />
      <AdminUserEditModal
        editModal={editModal}
        activeTab={activeTab}
        editForm={editForm}
        roleOptions={roleOptions}
        editError={editError}
        editSaving={editSaving}
        watchHistory={watchHistory}
        watchLoading={watchLoading}
        watchAction={watchAction}
        watchContentType={watchContentType}
        watchStartDate={watchStartDate}
        watchEndDate={watchEndDate}
        logFilter={logFilter}
        logsLoading={logsLoading}
        userLogs={userLogs}
        fallbackPoster={fallbackPoster}
        onClose={closeEditModal}
        onSelectTab={(tab) => {
          dispatch({ activeTab: tab });
          if (tab === "watch") {
            watchPageRef.current = 1;
          }
        }}
        onEditFormChange={(patch) =>
          dispatch((s) => ({ editForm: { ...s.editForm, ...patch } }))
        }
        onUpdateUser={handleUpdateUser}
        onWatchActionChange={(value) => {
          dispatch({ watchAction: value });
          watchPageRef.current = 1;
        }}
        onWatchContentTypeChange={(value) => {
          dispatch({ watchContentType: value });
          watchPageRef.current = 1;
        }}
        onWatchStartDateChange={(value) => {
          dispatch({ watchStartDate: value });
          watchPageRef.current = 1;
        }}
        onWatchEndDateChange={(value) => {
          dispatch({ watchEndDate: value });
          watchPageRef.current = 1;
        }}
        onRefreshWatchHistory={() => {
          if (editModal.user) {
            fetchWatchHistory(editModal.user.id, 1);
          }
        }}
        onWatchPageChange={(direction) => {
          if (!editModal.user) return;
          watchPageRef.current =
            direction === "previous"
              ? Math.max(1, watchPageRef.current - 1)
              : watchPageRef.current + 1;
          fetchWatchHistory(editModal.user.id, watchPageRef.current);
        }}
        onLogFilterChange={(value) => dispatch({ logFilter: value })}
        onLoadLogs={() => {
          if (userLogs.length === 0 && !logsLoading && editModal.user) {
            fetchUserLogs(editModal.user.id);
          }
        }}
      />
      <AdminUsersBanModal
        banModal={banModal}
        banReason={banReason}
        onBanReasonChange={(value) => dispatch({ banReason: value })}
        onCancel={() => {
          dispatch({ banModal: { open: false, user: null } });
          dispatch({ banReason: "" });
        }}
        onConfirm={handleBanUser}
      />
    </div>
  );
}
