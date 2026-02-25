import React, { type SyntheticEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PersonData } from "@/types/people.types";
import {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  FALLBACK_PROFILE,
} from "@/constants/app.constants";

interface PersonCardProps {
  person: PersonData;
}

const PersonCard = ({ person }: PersonCardProps) => {
  const getProfileImage = () => {
    const imageUrl = person.profile_path
      ? `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${person.profile_path}`
      : FALLBACK_PROFILE;
    return imageUrl;
  };

  const getKnownForText = () => {
    switch (person.known_for_department) {
      case "Acting":
        return "Actor";
      case "Directing":
        return "Director";
      case "Writing":
        return "Writer";
      case "Production":
        return "Production";
      default:
        return person.known_for_department || "Artist";
    }
  };

  return (
    <div className="group relative bg-gray-900 rounded-lg p-4">
      <Link href={`/people/${person.id}`} className="block">
        <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-700 mb-4">
          <Image
            src={getProfileImage()}
            alt={person.name}
            width={300}
            height={256}
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
