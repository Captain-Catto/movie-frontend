import type { Metadata } from "next";
import AccountPageClient from "@/components/pages/AccountPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/account",
    language,
    fallback: seo.account,
    forceNoIndex: true,
  });
}

export default function AccountPage() {
  return <AccountPageClient />;
}
