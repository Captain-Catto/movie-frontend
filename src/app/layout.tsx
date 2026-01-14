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
  title: {
    default: "MovieStream - Watch Movies & TV Shows Online",
    template: "%s | MovieStream",
  },
  description:
    "Stream thousands of movies and TV shows online. Watch the latest releases, trending content, and classic favorites on MovieStream.",
  keywords: [
    "movies",
    "tv shows",
    "streaming",
    "watch online",
    "entertainment",
    "cinema",
  ],
  authors: [{ name: "MovieStream" }],
  creator: "MovieStream",
  publisher: "MovieStream",
  metadataBase: new URL("https://movie.lequangtridat.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://movie.lequangtridat.com",
    title: "MovieStream - Watch Movies & TV Shows Online",
    description:
      "Stream thousands of movies and TV shows online. Watch the latest releases, trending content, and classic favorites.",
    siteName: "MovieStream",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieStream - Watch Movies & TV Shows Online",
    description:
      "Stream thousands of movies and TV shows online. Watch the latest releases and trending content.",
    creator: "@moviestream",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "-8vZ66NSFBBoT9mdhvoV1N8U116kETyyQMBrBS1sYfk",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="overflow-x-hidden">
      <body
        className={`${inter.variable} ${roboto.variable} antialiased overflow-x-hidden`}
      >
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
