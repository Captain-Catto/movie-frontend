import type { Metadata } from "next";
import { inter, roboto } from "@/lib/fonts";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { AuthLoader } from "@/components/auth/AuthLoader";
import { FavoritesLoader } from "@/components/favorites/FavoritesLoader";
import { ToastContainer } from "@/components/toast/ToastContainer";
import { InitialPageLoader } from "@/components/loading/InitialPageLoader";
import EffectManager from "@/components/effects/EffectManager";

export const metadata: Metadata = {
  title: "MovieStream",
  description: "Trang web xem phim trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="overflow-x-hidden">
      <body className={`${inter.variable} ${roboto.variable} antialiased overflow-x-hidden`}>
        <ReduxProvider>
          <InitialPageLoader />
          <AuthLoader />
          <FavoritesLoader />
          <ToastContainer />
          <EffectManager />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
