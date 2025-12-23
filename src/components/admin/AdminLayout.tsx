"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useAdminMetrics } from "@/hooks/useAdminMetrics";
import AdminSidebar from "./AdminSidebar";
import AdminMetricsBar from "./AdminMetricsBar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const sidebarOpen = true;
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { metrics } = useAdminMetrics();

  // Redirect non-admin users
  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated ||
        (user?.role !== "admin" && user?.role !== "super_admin"))
    ) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render admin content for non-admin users
  if (
    !isAuthenticated ||
    (user?.role !== "admin" && user?.role !== "super_admin")
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} user={user} />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="p-6 space-y-6">
            <AdminMetricsBar metrics={metrics} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
