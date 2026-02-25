import type { Metadata } from "next";
import FavoritesPageClient from "@/components/pages/FavoritesPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return {
    title: seo.favorites.title,
    description: seo.favorites.description,
  };
}

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
