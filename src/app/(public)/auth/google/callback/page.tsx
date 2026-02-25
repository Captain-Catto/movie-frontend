import type { Metadata } from "next";
import GoogleOAuthCallbackPageClient from "@/components/pages/GoogleOAuthCallbackPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  return resolvePageMetadata({
    path: "/auth/google/callback",
    language,
    fallback: seo.oauthCallback,
    forceNoIndex: true,
  });
}

export default function GoogleOAuthCallbackPage() {
  return <GoogleOAuthCallbackPageClient />;
}
