"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getLocaleFromLanguage,
} from "@/constants/app.constants";
import {
  getPersonDetailPageDataById,
  getPersonProfileImage,
  mapPersonCreditToMovieCardData,
} from "@/lib/people-detail-page-data";
import { getPageHookUiMessages } from "@/lib/ui-messages";
import type { PersonDetailData } from "@/lib/page-data.types";
import type {
  CastMember,
  CrewMember,
  MovieCardData,
} from "@/types/content.types";

const ITEMS_PER_PAGE = 20;
const BIO_TRUNCATE_LENGTH = 300;

export type PersonDetailTab = "cast" | "crew";

export interface UsePersonDetailPageClientOptions {
  personId: string;
  initialPersonData: PersonDetailData | null;
  initialCastCredits: CastMember[];
  initialCrewCredits: CrewMember[];
  initialError: string | null;
}

export interface UsePersonDetailPageClientResult {
  personData: PersonDetailData | null;
  loading: boolean;
  error: string | null;
  activeTab: PersonDetailTab;
  showFullBio: boolean;
  biographyText: string;
  canToggleBiography: boolean;
  profileImage: string;
  knownForText: string;
  formattedBirthday: string | null;
  formattedDeathday: string | null;
  castTotalItems: number;
  crewTotalItems: number;
  currentPage: number;
  totalPages: number;
  currentItems: MovieCardData[];
  handleTabChange: (tab: PersonDetailTab) => void;
  setCurrentPage: (page: number) => void;
  toggleBiography: () => void;
}

const truncateBiography = (bio: string, maxLength: number = BIO_TRUNCATE_LENGTH) => {
  if (!bio || bio.length <= maxLength) {
    return bio;
  }

  const truncated = bio.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );

  if (lastSentenceEnd > 0) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }

  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0
    ? `${truncated.substring(0, lastSpace)}...`
    : `${truncated}...`;
};

const mapKnownForDepartment = (
  department: string | undefined,
  labels: {
    knownForActor: string;
    knownForDirector: string;
    knownForWriter: string;
    knownForProducer: string;
    knownForArtist: string;
  }
): string => {
  switch (department) {
    case "Acting":
      return labels.knownForActor;
    case "Directing":
      return labels.knownForDirector;
    case "Writing":
      return labels.knownForWriter;
    case "Production":
      return labels.knownForProducer;
    default:
      return department || labels.knownForArtist;
  }
};

export function usePersonDetailPageClient({
  personId,
  initialPersonData,
  initialCastCredits,
  initialCrewCredits,
  initialError,
}: UsePersonDetailPageClientOptions): UsePersonDetailPageClientResult {
  const { language } = useLanguage();
  const labels = getPageHookUiMessages(language);
  const locale = getLocaleFromLanguage(language);

  type PersonState = {
    personData: PersonDetailData | null;
    castCredits: CastMember[];
    crewCredits: CrewMember[];
    loading: boolean;
    error: string | null;
    activeTab: PersonDetailTab;
    showFullBio: boolean;
    currentPage: number;
  };
  const [personState, dispatch] = useReducer(
    (s: PersonState, p: Partial<PersonState>): PersonState => ({ ...s, ...p }),
    {
      personData: initialPersonData,
      castCredits: initialCastCredits,
      crewCredits: initialCrewCredits,
      loading: !initialPersonData && !initialError,
      error: initialError,
      activeTab: "cast",
      showFullBio: false,
      currentPage: 1,
    }
  );
  const { personData, castCredits, crewCredits, loading, error, activeTab, showFullBio, currentPage } = personState;
  const skipInitialFetchRef = useRef(Boolean(initialPersonData));

  useEffect(() => {
    dispatch({
      personData: initialPersonData,
      castCredits: initialCastCredits,
      crewCredits: initialCrewCredits,
      error: initialError,
      loading: !initialPersonData && !initialError,
      activeTab: "cast",
      showFullBio: false,
      currentPage: 1,
    });
    skipInitialFetchRef.current = Boolean(initialPersonData);
  }, [
    personId,
    initialPersonData,
    initialCastCredits,
    initialCrewCredits,
    initialError,
  ]);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }

    const parsedPersonId = Number(personId);
    if (!Number.isFinite(parsedPersonId) || parsedPersonId <= 0) {
      dispatch({ personData: null, castCredits: [], crewCredits: [], error: labels.invalidPersonId, loading: false });
      return;
    }

    const fetchPersonData = async () => {
      dispatch({ loading: true });
      try {
        const result = await getPersonDetailPageDataById(parsedPersonId);
        dispatch({ personData: result.personData, castCredits: result.castCredits, crewCredits: result.crewCredits, error: result.error, loading: false });
      } catch (err) {
        dispatch({ personData: null, castCredits: [], crewCredits: [], error: err instanceof Error ? err.message : labels.unableToLoadActorInformation, loading: false });
      }
    };

    fetchPersonData();
  }, [personId, labels.invalidPersonId, labels.unableToLoadActorInformation]);

  const castTotalItems = castCredits.length;
  const crewTotalItems = crewCredits.length;

  const currentRawItems = activeTab === "cast" ? castCredits : crewCredits;

  const totalPages = Math.max(1, Math.ceil(currentRawItems.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      dispatch({ currentPage: 1 });
    }
  }, [currentPage, totalPages]);

  const currentItems = useMemo<MovieCardData[]>(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = currentRawItems.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
    return paginatedItems.map(mapPersonCreditToMovieCardData);
  }, [currentPage, currentRawItems]);

  const handleTabChange = (tab: PersonDetailTab) => {
    dispatch({ activeTab: tab, currentPage: 1 });
  };

  const toggleBiography = () => {
    dispatch({ showFullBio: !showFullBio });
  };

  const canToggleBiography =
    (personData?.biography?.length || 0) > BIO_TRUNCATE_LENGTH;
  const biographyText = showFullBio
    ? personData?.biography || ""
    : truncateBiography(personData?.biography || "");

  const formatDate = (dateString: string | null): string | null => {
    if (!dateString) {
      return null;
    }
    return new Date(dateString).toLocaleDateString(locale);
  };

  return {
    personData,
    loading,
    error,
    activeTab,
    showFullBio,
    biographyText,
    canToggleBiography,
    profileImage: getPersonProfileImage(personData?.profile_path),
    knownForText: mapKnownForDepartment(personData?.known_for_department, labels),
    formattedBirthday: formatDate(personData?.birthday ?? null),
    formattedDeathday: formatDate(personData?.deathday ?? null),
    castTotalItems,
    crewTotalItems,
    currentPage,
    totalPages,
    currentItems,
    handleTabChange,
    setCurrentPage: (page: number) => dispatch({ currentPage: page }),
    toggleBiography,
  };
}
