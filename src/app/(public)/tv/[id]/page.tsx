import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TVDetailPageClient from "@/components/pages/TVDetailPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getTVDetailPageDataByTmdbId } from "@/lib/detail-page-data";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

interface TVDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({
  params,
}: TVDetailPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : { id: "" };
  const tvId = resolvedParams.id;
  const parsedTmdbId = Number(tvId);
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  if (!tvId || !Number.isFinite(parsedTmdbId) || parsedTmdbId <= 0) {
    return resolvePageMetadata({
      path: "/tv/[id]",
      language,
      fallback: seo.tvDetailFallback,
    });
  }

  const { tvData } = await getTVDetailPageDataByTmdbId(parsedTmdbId, language);

  return resolvePageMetadata({
    path: `/tv/${parsedTmdbId}`,
    lookupPaths: ["/tv/[id]"],
    language,
    fallback: {
      title: tvData?.title || seo.tvDetailFallback.title,
      description: tvData?.overview || seo.tvDetailFallback.description,
    },
  });
}

export default async function TVDetailPage({ params }: TVDetailPageProps) {
  const resolvedParams = params ? await params : { id: "" };
  const tvId = resolvedParams.id;
  const parsedTmdbId = Number(tvId);

  if (!tvId || !Number.isFinite(parsedTmdbId) || parsedTmdbId <= 0) {
    notFound();
  }

  const language = await getServerPreferredLanguage();
  const { tvData, error } = await getTVDetailPageDataByTmdbId(
    parsedTmdbId,
    language
  );

  if (!tvData && !error) {
    notFound();
  }

  return (
    <TVDetailPageClient
      tvIdParam={tvId}
      initialLanguage={language}
      initialTVData={tvData}
      initialError={error}
    />
  );
}
