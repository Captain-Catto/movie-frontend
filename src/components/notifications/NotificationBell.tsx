"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getNotificationDropdownUiMessages } from "@/lib/ui-messages";

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({
  onClick,
  className,
}: NotificationBellProps) {
  const { language } = useLanguage();
  const { unreadCount, isConnected } = useNotificationSocket();
  const labels = getNotificationDropdownUiMessages(language);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn("relative text-white hover:bg-gray-700", className)}
      title={labels.unreadNotificationsTitle(unreadCount)}
    >
      <Bell size={20} />

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 text-white rounded-full font-semibold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}

      {/* Connection status indicator */}
      <div
        className={cn(
          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800",
          isConnected ? "bg-green-500" : "bg-red-500"
        )}
        title={isConnected ? labels.connected : labels.disconnected}
      />
    </Button>
  );
}
