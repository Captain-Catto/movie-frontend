import type { Metadata } from "next";
import FAQPageClient from "@/components/pages/FAQPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return {
    title: seo.faq.title,
    description: seo.faq.description,
  };
}

export default function FAQPage() {
  return <FAQPageClient />;
}
