import type { Metadata } from "next";
import AccountPageClient from "@/components/pages/AccountPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return {
    title: seo.account.title,
    description: seo.account.description,
  };
}

export default function AccountPage() {
  return <AccountPageClient />;
}
