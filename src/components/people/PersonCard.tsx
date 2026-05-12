"use client";

import React, { type SyntheticEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PersonData } from "@/types/people.types";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_PROFILE,
} from "@/constants/app.constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPeopleUiMessages } from "@/lib/ui-messages";

interface PersonCardProps {
  person: PersonData;
}

const PersonCard = ({ person }: PersonCardProps) => {
  const { language } = useLanguage();
  const labels = getPeopleUiMessages(language);

  const getProfileImage = () => {
    const path = (person as unknown as { profilePath?: string | null }).profilePath ?? person.profile_path;
    return path
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${path}`
      : FALLBACK_PROFILE;
  };

  const getKnownForText = () => {
    switch (person.known_for_department) {
      case "Acting":
        return labels.actor;
      case "Directing":
        return labels.director;
      case "Writing":
        return labels.writer;
      case "Production":
        return labels.production;
      default:
        return person.known_for_department || labels.artist;
    }
  };

  return (
    <div className="group relative w-full max-w-[180px] rounded-lg">
      <Link href={`/people/${person.id}`} className="block">
        <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-700 mb-4">
          <Image
            src={getProfileImage()}
            alt={person.name}
            width={300}
            height={450}
            className="w-full h-full object-cover"
            onError={(e: SyntheticEvent<HTMLImageElement>) => {
              console.error(
                "Failed to load image for:",
                person.name,
                getProfileImage()
              );
              e.currentTarget.src = FALLBACK_PROFILE;
            }}
          />
        </div>

        <div className="text-center">
          <h4 className="text-white font-semibold text-sm mb-1">
            {person.name}
          </h4>
          <p className="text-gray-400 text-xs">{getKnownForText()}</p>
        </div>
      </Link>
    </div>
  );
};

export default PersonCard;
