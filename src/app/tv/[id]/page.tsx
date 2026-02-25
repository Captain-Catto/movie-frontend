import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TVDetailPageClient from "@/components/pages/TVDetailPageClient";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getTVDetailPageDataByTmdbId } from "@/lib/detail-page-data";
import { getStaticPageSeo } from "@/lib/page-seo";

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
    return {
      title: seo.tvDetailFallback.title,
      description: seo.tvDetailFallback.description,
    };
  }

  const { tvData } = await getTVDetailPageDataByTmdbId(parsedTmdbId, language);

  return {
    title: tvData?.title || seo.tvDetailFallback.title,
    description: tvData?.overview || seo.tvDetailFallback.description,
  };
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
