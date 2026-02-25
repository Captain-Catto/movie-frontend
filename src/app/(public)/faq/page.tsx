import type { Metadata } from "next";
import FAQPageClient from "@/components/pages/FAQPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/faq",
    language,
    fallback: seo.faq,
  });
}

export default function FAQPage() {
  return <FAQPageClient />;
}
