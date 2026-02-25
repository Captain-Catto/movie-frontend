import type { Metadata } from "next";
import GoogleOAuthCallbackPageClient from "@/components/pages/GoogleOAuthCallbackPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return {
    title: seo.oauthCallback.title,
    description: seo.oauthCallback.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function GoogleOAuthCallbackPage() {
  return <GoogleOAuthCallbackPageClient />;
}
