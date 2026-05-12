"use client";

import { useNotificationSocketContext } from "@/contexts/NotificationSocketContext";

export function useNotificationSocket() {
  return useNotificationSocketContext();
}
