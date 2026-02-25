"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getLocaleFromLanguage,
} from "@/constants/app.constants";
import {
  getPersonDetailPageDataById,
  getPersonProfileImage,
  mapPersonCreditToMovieCardData,
} from "@/lib/people-detail-page-data";
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
  isVietnamese: boolean
): string => {
  switch (department) {
    case "Acting":
      return isVietnamese ? "Diễn viên" : "Actor";
    case "Directing":
      return isVietnamese ? "Đạo diễn" : "Director";
    case "Writing":
      return isVietnamese ? "Biên kịch" : "Writer";
    case "Production":
      return isVietnamese ? "Nhà sản xuất" : "Producer";
    default:
      return department || (isVietnamese ? "Nghệ sĩ" : "Artist");
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
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const locale = getLocaleFromLanguage(language);

  const [personData, setPersonData] = useState<PersonDetailData | null>(
    initialPersonData
  );
  const [castCredits, setCastCredits] = useState<CastMember[]>(initialCastCredits);
  const [crewCredits, setCrewCredits] = useState<CrewMember[]>(initialCrewCredits);
  const [loading, setLoading] = useState(() => !initialPersonData && !initialError);
  const [error, setError] = useState<string | null>(initialError);
  const [activeTab, setActiveTab] = useState<PersonDetailTab>("cast");
  const [showFullBio, setShowFullBio] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const skipInitialFetchRef = useRef(Boolean(initialPersonData));

  useEffect(() => {
    setPersonData(initialPersonData);
    setCastCredits(initialCastCredits);
    setCrewCredits(initialCrewCredits);
    setError(initialError);
    setLoading(!initialPersonData && !initialError);
    setActiveTab("cast");
    setShowFullBio(false);
    setCurrentPage(1);
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
      setPersonData(null);
      setCastCredits([]);
      setCrewCredits([]);
      setError(isVietnamese ? "ID nhân vật không hợp lệ" : "Invalid person ID");
      setLoading(false);
      return;
    }

    const fetchPersonData = async () => {
      try {
        setLoading(true);
        const result = await getPersonDetailPageDataById(parsedPersonId);
        setPersonData(result.personData);
        setCastCredits(result.castCredits);
        setCrewCredits(result.crewCredits);
        setError(result.error);
      } catch (err) {
        setPersonData(null);
        setCastCredits([]);
        setCrewCredits([]);
        setError(
          err instanceof Error
            ? err.message
            : isVietnamese
            ? "Không thể tải thông tin diễn viên"
            : "Unable to load actor information"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [personId, isVietnamese]);

  const castTotalItems = castCredits.length;
  const crewTotalItems = crewCredits.length;

  const currentRawItems = useMemo(
    () => (activeTab === "cast" ? castCredits : crewCredits),
    [activeTab, castCredits, crewCredits]
  );

  const totalPages = Math.max(1, Math.ceil(currentRawItems.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
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
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const toggleBiography = () => {
    setShowFullBio((prev) => !prev);
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
    knownForText: mapKnownForDepartment(personData?.known_for_department, isVietnamese),
    formattedBirthday: formatDate(personData?.birthday ?? null),
    formattedDeathday: formatDate(personData?.deathday ?? null),
    castTotalItems,
    crewTotalItems,
    currentPage,
    totalPages,
    currentItems,
    handleTabChange,
    setCurrentPage,
    toggleBiography,
  };
}
