"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
      <AdminTopBar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      <div className="flex pt-16">
        <AdminSidebar isOpen={sidebarOpen} />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
