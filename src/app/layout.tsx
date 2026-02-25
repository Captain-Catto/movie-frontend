import type { Metadata } from "next";
import { Suspense } from "react";
import { inter, roboto } from "@/lib/fonts";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { AuthLoader } from "@/components/auth/AuthLoader";
import { FavoritesLoader } from "@/components/favorites/FavoritesLoader";
import { ToastContainer } from "@/components/toast/ToastContainer";
import { InitialPageLoader } from "@/components/loading/InitialPageLoader";
import { TopLineLoader } from "@/components/loading/TopLineLoader";
import EffectManager from "@/components/effects/EffectManager";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getRootSeoUiMessages, resolveUiLocale } from "@/lib/ui-messages";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const labels = getRootSeoUiMessages(language);

  return {
    title: {
      default: labels.defaultTitle,
      template: "%s | MovieStream",
    },
    description: labels.description,
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
      locale: labels.openGraphLocale,
      url: "https://movie.lequangtridat.com",
      title: labels.defaultTitle,
      description: labels.openGraphDescription,
      siteName: "MovieStream",
    },
    twitter: {
      card: "summary_large_image",
      title: labels.defaultTitle,
      description: labels.twitterDescription,
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getServerPreferredLanguage();
  const htmlLang = resolveUiLocale(language);

  return (
    <html
      lang={htmlLang}
      data-scroll-behavior="smooth"
      className="overflow-x-hidden"
    >
      <body
        className={`${inter.variable} ${roboto.variable} antialiased overflow-x-hidden`}
      >
        <ReduxProvider>
          <Suspense fallback={null}>
            <TopLineLoader />
          </Suspense>
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
