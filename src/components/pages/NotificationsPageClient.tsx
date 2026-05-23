"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { Trash2 } from "lucide-react";
import { formatRelativeTimeByLanguage } from "@/utils/dateFormatter";
import NotificationDetailModal from "@/components/notifications/NotificationDetailModal";
import {
  useNotifications,
  getLocalizedNotif,
  badgeStyles,
  type NotificationItem,
} from "@/hooks/useNotifications";

import type { NotificationsPageUiMessages } from "@/lib/ui-messages";

interface NotificationsPageHeaderProps {
  labels: NotificationsPageUiMessages;
  notificationsLength: number;
  showUnreadOnly: boolean;
  onClear: () => void;
  onToggleUnread: () => void;
}

function NotificationsPageHeader({
  labels,
  notificationsLength,
  showUnreadOnly,
  onClear,
  onToggleUnread,
}: NotificationsPageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-800 shadow-xl p-6 mb-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{labels.pageTitle}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {labels.pageSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {notificationsLength > 0
              ? labels.notificationsCount(notificationsLength)
              : labels.noNotifications}
          </span>
          {notificationsLength > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border bg-red-950/40 border-red-800/60 text-red-200 hover:bg-red-900/50 cursor-pointer"
              title={labels.clearNotifications}
            >
              <Trash2 size={14} />
              {labels.clearNotifications}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleUnread}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border cursor-pointer ${
              showUnreadOnly
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750"
            }`}
          >
            {showUnreadOnly ? labels.showAll : labels.unreadOnly}
          </button>
        </div>
      </div>
    </div>
  );
}

interface NotificationItemViewProps {
  notif: NotificationItem;
  language: string;
  labels: NotificationsPageUiMessages;
  onClick: (notif: NotificationItem) => void;
  onDelete: (notif: NotificationItem) => void;
}

function NotificationItemView({
  notif,
  language,
  labels,
  onClick,
  onDelete,
}: NotificationItemViewProps) {
  const { title, message } = getLocalizedNotif(notif, language);
  return (
    <div
      className={`relative w-full bg-gray-850/60 border rounded-xl shadow-lg transition-all duration-200 hover:bg-gray-850 hover:shadow-xl ${
        notif.isRead
          ? "border-gray-750/50"
          : "border-blue-700/40 bg-gray-850/80"
      }`}
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full rounded-xl cursor-pointer"
        onClick={() => onClick(notif)}
        aria-label={title}
      />
      <div className="relative p-5 flex items-start gap-4 pointer-events-none">
        {/* Type Icon/Badge */}
        <div
          className={`px-3 py-1.5 text-xs rounded-lg font-semibold capitalize shadow-sm ${
            badgeStyles[notif.type]
          }`}
        >
          {labels.typeLabels[notif.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-white font-semibold text-base leading-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 whitespace-nowrap" suppressHydrationWarning>
                {formatRelativeTimeByLanguage(
                  new Date(notif.createdAt),
                  language
                )}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(notif);
                }}
                className="relative z-10 pointer-events-auto inline-flex size-8 items-center justify-center rounded-md text-red-300 hover:bg-red-950/40 hover:text-red-200 cursor-pointer"
                title={labels.deleteNotification}
                aria-label={labels.deleteNotification}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {message}
          </p>

          {/* Unread indicator */}
          {!notif.isRead && (
            <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-md">
              <span className="size-2 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-blue-300 font-medium">
                {labels.new}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const {
    isLoading,
    language,
    labels,
    locale,
    notifications,
    loading,
    error,
    isEmpty,
    showUnreadOnly,
    selectedNotification,
    filteredEmpty,
    groupedByDate,
    sortedDateKeys,
    setSelectedNotification,
    setShowUnreadOnly,
    handleNotificationClick,
    handleDeleteNotification,
    handleClearNotifications,
  } = useNotifications();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
      <Header />
      <main>
        <Container size="narrow" withHeaderOffset className="pb-12">
          <NotificationsPageHeader
            labels={labels}
            notificationsLength={notifications.length}
            showUnreadOnly={showUnreadOnly}
            onClear={handleClearNotifications}
            onToggleUnread={() => setShowUnreadOnly((v) => !v)}
          />

          {loading || isLoading ? (
            <div className="text-gray-300 bg-gray-800 border border-gray-700 rounded-lg p-4">
              {labels.loading}
            </div>
          ) : null}

          {error && (
            <div className="text-red-300 bg-red-900/40 border border-red-700 rounded-lg p-4">
              {error}
            </div>
          )}

          {!loading && !isLoading && !error && (
            <>
              {isEmpty ? (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center text-gray-300 min-h-[300px] flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-white mb-2">
                    {labels.noNotificationsYet}
                  </div>
                  <p className="text-sm text-gray-400">
                    {labels.noNotificationsDesc}
                  </p>
                </div>
              ) : filteredEmpty ? (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center text-gray-300 min-h-[300px] flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-white mb-2">
                    {labels.noUnread}
                  </div>
                  <p className="text-sm text-gray-400">
                    {labels.noUnreadDesc}
                  </p>
                </div>
              ) : null}
            </>
          )}

          {sortedDateKeys.length > 0 && (
            <div className="space-y-6">
              {sortedDateKeys.map((dateKey) => {
                const day = new Date(dateKey);
                const dayLabel = day.toLocaleDateString(locale, {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                return (
                  <div key={dateKey} className="space-y-3">
                    <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide px-1" suppressHydrationWarning>
                      {dayLabel}
                    </div>
                    {groupedByDate[dateKey].map((notif) => (
                      <NotificationItemView
                        key={notif.id}
                        notif={notif}
                        language={language}
                        labels={labels}
                        onClick={handleNotificationClick}
                        onDelete={handleDeleteNotification}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
