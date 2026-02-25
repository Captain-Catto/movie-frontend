import { notFound } from "next/navigation";
import PeopleDetailPageClient from "@/components/pages/PeopleDetailPageClient";
import { getPersonDetailPageDataById } from "@/lib/people-detail-page-data";

interface PersonDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
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
