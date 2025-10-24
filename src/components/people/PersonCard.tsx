import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { PersonData } from "@/app/people/page";

interface PersonCardProps {
  person: PersonData;
}

const PersonCard = ({ person }: PersonCardProps) => {
  // Debug: Log person data
  console.log("PersonCard received person:", person);

  const getProfileImage = () => {
    const imageUrl = person.profile_path
      ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
      : "/images/no-avatar.svg";

    console.log("Profile image URL for", person.name, ":", imageUrl);
    return imageUrl;
  };

  const getKnownForText = () => {
    switch (person.known_for_department) {
      case "Acting":
        return "Diễn viên";
      case "Directing":
        return "Đạo diễn";
      case "Writing":
        return "Biên kịch";
      case "Production":
        return "Sản xuất";
      default:
        return person.known_for_department || "Nghệ sĩ";
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
            onError={(e) => {
              console.error(
                "Failed to load image for:",
                person.name,
                getProfileImage()
              );
              (e.target as HTMLImageElement).src = "/images/no-avatar.svg";
            }}
            onLoad={() => {
              console.log("Successfully loaded image for:", person.name);
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
