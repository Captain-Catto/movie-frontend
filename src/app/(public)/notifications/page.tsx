import type { Metadata } from "next";
import NotificationsPageClient from "@/components/pages/NotificationsPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/notifications",
    language,
    fallback: seo.notifications,
    forceNoIndex: true,
  });
}

export default function NotificationsPage() {
  return <NotificationsPageClient />;
}
