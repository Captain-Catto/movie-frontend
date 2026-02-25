import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PeopleDetailPageClient from "@/components/pages/PeopleDetailPageClient";
import { getPersonDetailPageDataById } from "@/lib/people-detail-page-data";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getStaticPageSeo } from "@/lib/page-seo";
import { resolvePageMetadata } from "@/lib/seo-resolver";

interface PersonDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({
  params,
}: PersonDetailPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : { id: "" };
  const personId = resolvedParams.id;
  const parsedPersonId = Number(personId);
  const language = await getServerPreferredLanguage();
  const seo = getStaticPageSeo(language);

  if (!personId || !Number.isFinite(parsedPersonId) || parsedPersonId <= 0) {
    return resolvePageMetadata({
      path: "/people/[id]",
      language,
      fallback: seo.peopleDetailFallback,
    });
  }

  const { personData } = await getPersonDetailPageDataById(parsedPersonId);
  const biography = personData?.biography;
  const hasBiography =
    biography &&
    biography !== "No biography available" &&
    biography !== "Chưa có tiểu sử";

  return resolvePageMetadata({
    path: `/people/${parsedPersonId}`,
    lookupPaths: ["/people/[id]"],
    language,
    fallback: {
      title: personData?.name || seo.peopleDetailFallback.title,
      description: hasBiography ? biography : seo.peopleDetailFallback.description,
    },
  });
}

export default async function PersonDetailPage({ params }: PersonDetailPageProps) {
  const resolvedParams = params ? await params : { id: "" };
  const personId = resolvedParams.id;
  const parsedPersonId = Number(personId);

  if (!personId || !Number.isFinite(parsedPersonId) || parsedPersonId <= 0) {
    notFound();
  }

  const { personData, castCredits, crewCredits, error } =
    await getPersonDetailPageDataById(parsedPersonId);

  if (!personData && !error) {
    notFound();
  }

  return (
    <PeopleDetailPageClient
      personId={personId}
      initialPersonData={personData}
      initialCastCredits={castCredits}
      initialCrewCredits={crewCredits}
      initialError={error}
    />
  );
}
