import type { Metadata } from "next";
import FavoritesPageClient from "@/components/pages/FavoritesPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/favorites",
    language,
    fallback: seo.favorites,
    forceNoIndex: true,
  });
}

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
