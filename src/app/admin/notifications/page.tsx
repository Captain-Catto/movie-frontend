"use client";

import { useNotificationsData } from "@/hooks/useNotificationsData";
import NotificationsHeader from "@/components/notifications/NotificationsHeader";
import NotificationsStatsCards from "@/components/notifications/NotificationsStatsCards";
import NotificationsTable from "@/components/notifications/NotificationsTable";
import NotificationModal from "@/components/notifications/NotificationModal";

export default function AdminNotificationsPage() {
  const {
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
    handleDeleteNotification,
    handleSendNotification,
    handleCloseModal,
  } = useNotificationsData();

  const handleClearFilters = () => {
    setFilters({ type: "all", startDate: "", endDate: "" });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Notification Management</h1>
        <p className="text-gray-400">
          Send, review, and manage notifications delivered to users.
        </p>
      </div>

      <NotificationsHeader
        showTitle={false}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        onOpenSendModal={(type) => setSendModal({ open: true, type })}
        setFormData={setFormData}
        formData={formData}
      />

      <NotificationsStatsCards stats={stats} />

      <NotificationsTable
        notifications={notifications}
        loading={loading}
        pagination={pagination}
        onPaginationChange={setPagination}
        onDeleteNotification={handleDeleteNotification}
      />

      <NotificationModal
        sendModal={sendModal}
        formData={formData}
        onFormDataChange={setFormData}
        onClose={handleCloseModal}
        onSend={handleSendNotification}
      />
    </div>
  );
}
