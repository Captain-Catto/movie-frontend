import type { Metadata } from "next";
import NotificationsPageClient from "@/components/pages/NotificationsPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return {
    title: seo.notifications.title,
    description: seo.notifications.description,
  };
}

export default function NotificationsPage() {
  return <NotificationsPageClient />;
}
