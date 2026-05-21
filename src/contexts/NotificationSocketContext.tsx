"use client";

import {
  createContext,
  useCallback,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  titleVi?: string;
  messageVi?: string;
  titleEn?: string;
  messageEn?: string;
  type: "info" | "success" | "warning" | "error" | "system";
  createdAt: Date;
  metadata?: {
    movieId?: number;
    tvId?: number;
    commentId?: number;
    parentId?: number;
    [key: string]: unknown;
  };
}

export interface NotificationSocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  latestNotification: NotificationData | null;
  markAsRead: (notificationId: number) => boolean;
  markAllAsRead: () => boolean;
  setUnreadCount: Dispatch<SetStateAction<number>>;
}

const NotificationSocketContext =
  createContext<NotificationSocketContextValue | null>(null);

export function NotificationSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] =
    useState<NotificationData | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setUnreadCount(0);
        setLatestNotification(null);
      }
      return;
    }

    let newSocket: Socket | null = null;

    const handleConnect = () => {
      if (newSocket) { setIsConnected(true); setSocket(newSocket); }
    };
    const handleDisconnect = () => { setIsConnected(false); };
    const handleConnectError = (error: Error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    };
    const handleAuthError = (error: Error) => {
      console.error("Socket authentication failed:", error);
      setIsConnected(false);
    };
    const handleNewNotification = (notification: NotificationData) => {
      const createdAt =
        notification?.createdAt instanceof Date
          ? notification.createdAt
          : new Date(notification?.createdAt || Date.now());
      setLatestNotification({ ...notification, createdAt });
    };
    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    const timer = setTimeout(() => {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      newSocket = io(`${API_BASE_URL}/notifications`, {
        auth: { token },
        transports: ["polling", "websocket"],
        autoConnect: true,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      socketRef.current = newSocket;
      newSocket.on("connect", handleConnect);
      newSocket.on("disconnect", handleDisconnect);
      newSocket.on("connect_error", handleConnectError);
      newSocket.on("auth:error", handleAuthError);
      newSocket.on("notification:new", handleNewNotification);
      newSocket.on("notification:unread-count", handleUnreadCount);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (newSocket) {
        newSocket.off("connect", handleConnect);
        newSocket.off("disconnect", handleDisconnect);
        newSocket.off("connect_error", handleConnectError);
        newSocket.off("auth:error", handleAuthError);
        newSocket.off("notification:new", handleNewNotification);
        newSocket.off("notification:unread-count", handleUnreadCount);
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, token]);

  const markAsRead = useCallback((notificationId: number) => {
    if (!socketRef.current?.connected) return false;
    socketRef.current.emit("notification:mark-read", { notificationId });
    return true;
  }, []);

  const markAllAsRead = useCallback(() => {
    if (!socketRef.current?.connected) return false;
    socketRef.current.emit("notification:mark-all-read");
    return true;
  }, []);

  return (
    <NotificationSocketContext.Provider
      value={{
        socket,
        isConnected,
        unreadCount,
        latestNotification,
        markAsRead,
        markAllAsRead,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationSocketContext.Provider>
  );
}

export function useNotificationSocketContext(): NotificationSocketContextValue {
  const context = use(NotificationSocketContext);
  if (!context) {
    throw new Error(
      "useNotificationSocket must be used within NotificationSocketProvider"
    );
  }
  return context;
}
