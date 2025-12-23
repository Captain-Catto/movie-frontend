"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAdminAnalyticsSocket } from "@/hooks/useAdminAnalyticsSocket";

type AdminAnalyticsContextValue = Pick<
  ReturnType<typeof useAdminAnalyticsSocket>,
  "snapshot" | "isConnected" | "lastUpdateAt"
>;

const AdminAnalyticsContext = createContext<
  AdminAnalyticsContextValue | undefined
>(undefined);

export function AdminAnalyticsProvider({
  value,
  children,
}: {
  value: AdminAnalyticsContextValue;
  children: ReactNode;
}) {
  return (
    <AdminAnalyticsContext.Provider value={value}>
      {children}
    </AdminAnalyticsContext.Provider>
  );
}

export function useAdminAnalyticsContext(): AdminAnalyticsContextValue {
  const ctx = useContext(AdminAnalyticsContext);
  if (!ctx) {
    throw new Error(
      "useAdminAnalyticsContext must be used within AdminAnalyticsProvider"
    );
  }
  return ctx;
}
