import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { ClientBootstrap } from "@/components/providers/ClientBootstrap";
import { NotificationSocketProvider } from "@/contexts/NotificationSocketContext";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <NotificationSocketProvider>
        <ClientBootstrap />
        {children}
      </NotificationSocketProvider>
    </ReduxProvider>
  );
}
