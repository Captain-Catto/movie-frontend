// Notification Types and Interfaces

import type { Pagination } from "./api";

export interface NotificationAnalyticsSummary {
  totalTargetedUsers: number;
  deliveredCount: number;
  readCount: number;
  dismissedCount: number;
  clickCount: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  targetType: "all" | "role" | "user";
  targetValue?: string;
  createdAt: string;
  analytics?: NotificationAnalyticsSummary;
  createdBy?: {
    id: number;
    email: string;
    name: string;
  } | null;
}

export interface NotificationStats {
  totalSent: number;
  totalUsers: number;
  totalRead: number;
  totalUnread: number;
}

export type PaginationMeta = Pagination;

export interface NotificationFilters {
  type: "all" | "info" | "warning" | "success" | "error";
  startDate: string;
  endDate: string;
}

export type SendModalType = "broadcast" | "role" | "user" | "maintenance";

export interface SendModalState {
  open: boolean;
  type: SendModalType;
}

export interface NotificationFormData {
  title: string;
  message: string;
  targetType: "all" | "role" | "user";
  targetValue: string;
  notificationType: "info" | "warning" | "success" | "error";
  userId: string;
  role: "user" | "admin";
  maintenanceStartTime: string;
  maintenanceEndTime: string;
}

// Type badge colors mapping
export const NOTIFICATION_TYPE_COLORS = {
  success: "bg-green-900 text-green-300",
  error: "bg-red-900 text-red-300",
  warning: "bg-yellow-900 text-yellow-300",
  info: "bg-blue-900 text-blue-300",
} as const;

// Send modal button configurations
export interface SendModalButtonConfig {
  type: SendModalType;
  title: string;
  description: string;
  bgColor: string;
  hoverColor: string;
  icon: string;
}

export const SEND_MODAL_BUTTONS: SendModalButtonConfig[] = [
  {
    type: "broadcast",
    title: "Send Broadcast",
    description: "Send general announcement to all users",
    bgColor: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
    icon: "mail",
  },
  {
    type: "role",
    title: "Send to Role",
    description: "Target users by their role (user/admin)",
    bgColor: "bg-green-600",
    hoverColor: "hover:bg-green-700",
    icon: "users",
  },
  {
    type: "user",
    title: "Send to User",
    description: "Send notification to specific user by ID",
    bgColor: "bg-purple-600",
    hoverColor: "hover:bg-purple-700",
    icon: "user",
  },
  {
    type: "maintenance",
    title: "Maintenance Notice",
    description: "High priority system maintenance alert with schedule",
    bgColor: "bg-orange-600",
    hoverColor: "hover:bg-orange-700",
    icon: "warning",
  },
];
