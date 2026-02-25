import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { ClientBootstrap } from "@/components/providers/ClientBootstrap";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <ClientBootstrap />
      {children}
    </ReduxProvider>
  );
}
