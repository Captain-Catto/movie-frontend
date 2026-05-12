import type { Metadata } from "next";
import AdminLayout from "@/components/admin/AdminLayout";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { AdminBootstrap } from "@/components/providers/AdminBootstrap";
import { NotificationSocketProvider } from "@/contexts/NotificationSocketContext";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <NotificationSocketProvider>
        <AdminBootstrap />
        <AdminLayout>{children}</AdminLayout>
      </NotificationSocketProvider>
    </ReduxProvider>
  );
}
