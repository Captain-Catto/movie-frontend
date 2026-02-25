"use client";

import Image from "next/image";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import MovieCard from "@/components/movie/MovieCard";
import { Pagination } from "@/components/ui/Pagination";
import { usePersonDetailPageClient } from "@/hooks/pages/usePersonDetailPageClient";
import type { CastMember, CrewMember } from "@/types/content.types";
import type { PersonDetailData } from "@/lib/people-detail-page-data";

interface PeopleDetailPageClientProps {
  personId: string;
  initialPersonData: PersonDetailData | null;
  initialCastCredits: CastMember[];
  initialCrewCredits: CrewMember[];
  initialError: string | null;
}

const PeopleDetailPageClient = ({
  personId,
  initialPersonData,
  initialCastCredits,
  initialCrewCredits,
  initialError,
}: PeopleDetailPageClientProps) => {
  const {
    personData,
    loading,
    activeTab,
    showFullBio,
    biographyText,
    canToggleBiography,
    profileImage,
    knownForText,
    formattedBirthday,
    formattedDeathday,
    castTotalItems,
    crewTotalItems,
    currentPage,
    totalPages,
    currentItems,
    handleTabChange,
    setCurrentPage,
    toggleBiography,
  } = usePersonDetailPageClient({
    personId,
    initialPersonData,
    initialCastCredits,
    initialCrewCredits,
    initialError,
  });

  if (loading) {
    return (
      <Layout>
        <DetailPageSkeleton />
      </Layout>
    );
  }

  if (!personData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded">
            {initialError || "Unable to load person details."}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <Container withHeaderOffset>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-gray-800">
                <Image
                  src={profileImage}
                  alt={personData.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {personData.name}
                </h1>
                <p className="text-xl text-red-400 mb-4">{knownForText}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formattedBirthday && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">
                      Date of Birth
                    </h3>
                    <p className="text-white">{formattedBirthday}</p>
                  </div>
                )}

                {personData.place_of_birth && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">
                      Place of Birth
                    </h3>
                    <p className="text-white">{personData.place_of_birth}</p>
                  </div>
                )}

                {formattedDeathday && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">
                      Date of Death
                    </h3>
                    <p className="text-white">{formattedDeathday}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Biography</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {personData.biography ? (
                    <>
                      {biographyText}
                      {canToggleBiography && (
                        <button
                          onClick={toggleBiography}
                          className="ml-2 text-red-400 hover:text-red-300 font-medium transition-colors inline-block cursor-pointer"
                        >
                          {showFullBio ? "Show less" : "Read more"}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400 italic">Biography not available yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>

        <Container>
          <div className="border-t border-gray-700 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Filmography</h2>

            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => handleTabChange("cast")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "cast"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Acting ({castTotalItems})
              </button>
              <button
                onClick={() => handleTabChange("crew")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "crew"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Crew ({crewTotalItems})
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {currentItems.map((item, index) => (
                <MovieCard
                  key={`${activeTab}-${item.tmdbId}-${index}`}
                  movie={item}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  className="mb-8"
                />
              </div>
            )}

            {currentItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No {activeTab === "cast" ? "acting credits" : "crew credits"}{" "}
                  available
                </p>
              </div>
            )}
          </div>
        </Container>
      </div>
    </Layout>
  );
};

export default PeopleDetailPageClient;
