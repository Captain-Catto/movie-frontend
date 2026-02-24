"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import MovieCard from "@/components/movie/MovieCard";
import type { MovieCardData } from "@/types/content.types";
import type { CastMember, CrewMember } from "@/types";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { apiService } from "@/services/api";
import Container from "@/components/ui/Container";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_POSTER,
  FALLBACK_PROFILE,
  getLocaleFromLanguage,
} from "@/constants/app.constants";

interface PersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

interface PersonCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

interface PaginatedCastCredits {
  cast: CastMember[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  metadata: {
    fromCache: boolean;
    totalCastItems: number;
    cacheInfo?: Record<string, unknown>;
  };
}

interface PaginatedCrewCredits {
  crew: CrewMember[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  metadata: {
    fromCache: boolean;
    totalCrewItems: number;
    cacheInfo?: Record<string, unknown>;
  };
}

const PersonDetailPage = () => {
  const params = useParams();
  const personId = params.id as string;
  const { language } = useLanguage();
  const locale = getLocaleFromLanguage(language);
  const [personData, setPersonData] = useState<PersonDetail | null>(null);
  const [castCredits, setCastCredits] = useState<PaginatedCastCredits | null>(
    null
  );
  const [crewCredits, setCrewCredits] = useState<PaginatedCrewCredits | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");
  const [showFullBio, setShowFullBio] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Group crew items by movie to combine multiple jobs
  const groupCrewByMovie = (crewItems: PaginatedCrewCredits["crew"]) => {
    const grouped = crewItems.reduce((acc, item) => {
      const key = `${item.id}-${item.media_type}`;
      if (acc[key]) {
        // Combine job titles
        const existingJob = acc[key].job || "";
        const newJob = item.job || "";
        if (existingJob && newJob && existingJob !== newJob) {
          acc[key].job = `${existingJob}, ${newJob}`;
        } else if (newJob) {
          acc[key].job = newJob;
        }
      } else {
        acc[key] = { ...item };
      }
      return acc;
    }, {} as Record<string, PaginatedCrewCredits["crew"][0]>);

    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchAllCredits = async () => {
      try {
        const response = await apiService.getPersonCredits(parseInt(personId));

        if (response) {
          // Split data into cast and crew for separate pagination
          const castData: PaginatedCastCredits = {
            cast: response.cast,
            pagination: {
              currentPage: 1,
              totalPages: Math.ceil(response.cast.length / itemsPerPage),
              totalItems: response.cast.length,
              limit: itemsPerPage,
              hasNextPage: 1 < Math.ceil(response.cast.length / itemsPerPage),
              hasPreviousPage: false,
            },
            metadata: {
              fromCache: true,
              totalCastItems: response.cast.length,
            },
          };

          const groupedCrew = groupCrewByMovie(response.crew);
          const crewData: PaginatedCrewCredits = {
            crew: response.crew, // Keep original for grouping
            pagination: {
              currentPage: 1,
              totalPages: Math.ceil(groupedCrew.length / itemsPerPage),
              totalItems: groupedCrew.length,
              limit: itemsPerPage,
              hasNextPage: 1 < Math.ceil(groupedCrew.length / itemsPerPage),
              hasPreviousPage: false,
            },
            metadata: {
              fromCache: true,
              totalCrewItems: groupedCrew.length, // Use grouped count
            },
          };

          setCastCredits(castData);
          setCrewCredits(crewData);
        }
      } catch (err) {
        console.error("Error fetching person credits:", err);
        setError("Unable to load movie list");
      }
    };

    const fetchPersonData = async () => {
      try {
        setLoading(true);

        const personResponse = await apiService.getPersonDetails(
          parseInt(personId)
        );

        if (personResponse) {
          const normalizedPerson: PersonDetail = {
            id: personResponse.id,
            name: personResponse.name,
            biography: personResponse.biography ?? "No biography available",
            birthday: personResponse.birthday ?? null,
            deathday: personResponse.deathday ?? null,
            place_of_birth: personResponse.place_of_birth ?? null,
            profile_path: personResponse.profile_path ?? null,
            known_for_department:
              typeof personResponse.known_for_department === "string"
                ? personResponse.known_for_department
                : "Unknown",
            popularity:
              typeof personResponse.popularity === "number"
                ? personResponse.popularity
                : 0,
          };
          setPersonData(normalizedPerson);
        }

        // Fetch all credits data
        await fetchAllCredits();

        setError(null);
      } catch (err) {
        console.error("Error fetching person data:", err);
        setError("Unable to load actor information");
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchPersonData();
    }
  }, [personId, itemsPerPage]);

  // Update pagination info when page or tab changes
  useEffect(() => {
    if (castCredits && crewCredits) {
      // Update pagination info for current tab
      const currentData = activeTab === "cast" ? castCredits : crewCredits;
      const totalPages = currentData.pagination.totalPages;

      // Reset to page 1 if current page is beyond available pages
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
      }
    }
  }, [activeTab, castCredits, crewCredits, currentPage]);

  // Reset page to 1 when switching tabs
  const handleTabChange = (tab: "cast" | "crew") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getProfileImage = () => {
    if (personData?.profile_path) {
      return `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${personData.profile_path}`;
    }
    return FALLBACK_PROFILE;
  };

  const getKnownForText = () => {
    switch (personData?.known_for_department) {
      case "Acting":
        return "Actor";
      case "Directing":
        return "Director";
      case "Writing":
        return "Writer";
      case "Production":
        return "Producer";
      default:
        return personData?.known_for_department || "Artist";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(locale);
  };

  const truncateBiography = (bio: string, maxLength: number = 300) => {
    if (!bio) return "";
    if (bio.length <= maxLength) return bio;

    // Find the last complete sentence within the limit
    const truncated = bio.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf("."),
      truncated.lastIndexOf("!"),
      truncated.lastIndexOf("?")
    );

    if (lastSentenceEnd > 0) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }

    // If no sentence end found, find last space
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 0
      ? truncated.substring(0, lastSpace) + "..."
      : truncated + "...";
  };

  const convertToMovieCardData = (
    item: PersonCredits["cast"][0] | PersonCredits["crew"][0]
  ): MovieCardData => {
    const posterPath = item.poster_path ?? item.profile_path ?? null;
    const mediaType = item.media_type === "tv" ? "tv" : "movie";
    const releaseDate = item.release_date ?? item.first_air_date ?? null;
    const character =
      "character" in item && typeof item.character === "string"
        ? item.character
        : undefined;
    const job =
      "job" in item && typeof item.job === "string" ? item.job : undefined;

    return {
      id: item.id.toString(),
      tmdbId: item.id,
      title: item.title || item.name || "",
      aliasTitle: character || job || item.title || item.name || "",
      poster: posterPath
        ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${posterPath}`
        : FALLBACK_POSTER,
      href: mediaType === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`,
      year: releaseDate ? new Date(releaseDate).getFullYear() : undefined,
      rating:
        typeof item.vote_average === "number" ? item.vote_average : undefined,
    };
  };

  if (loading) {
    return (
      <Layout>
        <DetailPageSkeleton />
      </Layout>
    );
  }

    if (error || !personData) {
      notFound();
    }

  // Get paginated items for current tab
  const getPaginatedItems = () => {
    if (activeTab === "cast") {
      const allCast = castCredits?.cast || [];
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return allCast.slice(startIndex, endIndex);
    } else {
      const allCrew = crewCredits?.crew || [];
      const groupedCrew = groupCrewByMovie(allCrew);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return groupedCrew.slice(startIndex, endIndex);
    }
  };

  const castItems = activeTab === "cast" ? getPaginatedItems() : [];
  const crewItems = activeTab === "crew" ? getPaginatedItems() : [];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        {/* Hero Section */}
        <Container withHeaderOffset>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Image */}
            <div className="lg:col-span-1">
              <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-gray-800">
                <Image
                  src={getProfileImage()}
                  alt={personData.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Person Info */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {personData.name}
                </h1>
                <p className="text-xl text-red-400 mb-4">{getKnownForText()}</p>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personData.birthday && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">
                      Date of Birth
                    </h3>
                    <p className="text-white">
                      {formatDate(personData.birthday)}
                    </p>
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

                {personData.deathday && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">
                      Date of Death
                    </h3>
                    <p className="text-white">
                      {formatDate(personData.deathday)}
                    </p>
                  </div>
                )}
              </div>

              {/* Biography */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Biography
                </h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {personData.biography ? (
                    <>
                      {showFullBio
                        ? personData.biography
                        : truncateBiography(personData.biography)}
                      {personData.biography.length > 300 && (
                        <button
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="ml-2 text-red-400 hover:text-red-300 font-medium transition-colors inline-block cursor-pointer"
                        >
                          {showFullBio ? "Show less" : "Read more"}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400 italic">
                      Biography not available yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Filmography Section */}
        <Container>
          <div className="border-t border-gray-700 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Filmography</h2>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => handleTabChange("cast")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "cast"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Acting ({castCredits?.metadata.totalCastItems || 0})
              </button>
              <button
                onClick={() => handleTabChange("crew")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "crew"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Crew ({crewCredits?.metadata.totalCrewItems || 0})
              </button>
            </div>

            {/* Movies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {activeTab === "cast" &&
                castItems.map((item, index) => (
                  <MovieCard
                    key={`cast-${item.media_type}-${item.id}-${index}`}
                    movie={convertToMovieCardData(item)}
                  />
                ))}

              {activeTab === "crew" &&
                crewItems.map((item, index) => (
                  <MovieCard
                    key={`crew-${item.media_type}-${item.id}-${index}`}
                    movie={convertToMovieCardData(item)}
                  />
                ))}
            </div>

            {/* Pagination for cast tab */}
            {activeTab === "cast" &&
              castCredits?.pagination &&
              castCredits.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={castCredits.pagination.totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    className="mb-8"
                  />
                </div>
              )}

            {/* Pagination for crew tab */}
            {activeTab === "crew" &&
              crewCredits?.pagination &&
              crewCredits.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={crewCredits.pagination.totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    className="mb-8"
                  />
                </div>
              )}

            {/* Empty state */}
            {((activeTab === "cast" && castItems.length === 0) ||
              (activeTab === "crew" && crewItems.length === 0)) && (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No{" "}
                  {activeTab === "cast" ? "acting credits" : "crew credits"}{" "}
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

export default PersonDetailPage;
