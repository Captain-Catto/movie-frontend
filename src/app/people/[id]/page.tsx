"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Layout from "@/components/layout/Layout";
import MovieCard from "@/components/movie/MovieCard";
import { MovieCardData } from "@/components/movie/MovieCard";
import DetailPageSkeleton from "@/components/ui/DetailPageSkeleton";
import { apiService } from "@/services/api";

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
  cast: Array<{
    id: number;
    title?: string;
    name?: string;
    character?: string;
    job?: string;
    media_type: "movie" | "tv";
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
  }>;
  crew: Array<{
    id: number;
    title?: string;
    name?: string;
    character?: string;
    job?: string;
    media_type: "movie" | "tv";
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
  }>;
}

const PersonDetailPage = () => {
  const params = useParams();
  const personId = params.id as string;
  const [personData, setPersonData] = useState<PersonDetail | null>(null);
  const [credits, setCredits] = useState<PersonCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setLoading(true);

        // Fetch person details and credits
        const [personResponse, creditsResponse] = await Promise.all([
          apiService.getPersonDetails(parseInt(personId)),
          apiService.getPersonCredits(parseInt(personId)),
        ]);

        if (personResponse) {
          setPersonData(personResponse);
        }

        if (creditsResponse) {
          setCredits(creditsResponse);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching person data:", err);
        setError("Không thể tải thông tin diễn viên");
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchPersonData();
    }
  }, [personId]);

  const getProfileImage = () => {
    if (personData?.profile_path) {
      return `https://image.tmdb.org/t/p/w500${personData.profile_path}`;
    }
    return "/images/no-avatar.jpg";
  };

  const getKnownForText = () => {
    switch (personData?.known_for_department) {
      case "Acting":
        return "Diễn viên";
      case "Directing":
        return "Đạo diễn";
      case "Writing":
        return "Biên kịch";
      case "Production":
        return "Sản xuất";
      default:
        return personData?.known_for_department || "Nghệ sĩ";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const convertToMovieCardData = (
    item: PersonCredits["cast"][0] | PersonCredits["crew"][0]
  ): MovieCardData => {
    return {
      id: item.id.toString(),
      title: item.title || item.name || "",
      aliasTitle: item.character || item.job || "",
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
        : "/images/no-poster.jpg",
      href: `/movie/${item.id}`, // Direct TMDB ID - backend now handles TMDB ID by default
      year: item.release_date
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date
        ? new Date(item.first_air_date).getFullYear()
        : undefined,
      rating: item.vote_average,
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
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Không tìm thấy diễn viên
            </h1>
            <p className="text-gray-400">
              {error || "Diễn viên này không tồn tại"}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const castItems = credits?.cast || [];
  const crewItems = credits?.crew || [];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        {/* Hero Section */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <p className="text-xl text-red-400 mb-4">
                    {getKnownForText()}
                  </p>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personData.birthday && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">
                        Ngày sinh
                      </h3>
                      <p className="text-white">
                        {formatDate(personData.birthday)}
                      </p>
                    </div>
                  )}

                  {personData.place_of_birth && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">
                        Nơi sinh
                      </h3>
                      <p className="text-white">{personData.place_of_birth}</p>
                    </div>
                  )}

                  {personData.deathday && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">
                        Ngày mất
                      </h3>
                      <p className="text-white">
                        {formatDate(personData.deathday)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Biography */}
                {personData.biography && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Tiểu sử
                    </h3>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {personData.biography}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filmography Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-t border-gray-700 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Filmography</h2>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab("cast")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "cast"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Diễn xuất ({castItems.length})
              </button>
              <button
                onClick={() => setActiveTab("crew")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "crew"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Thành viên đoàn phim ({crewItems.length})
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

            {/* Empty state */}
            {((activeTab === "cast" && castItems.length === 0) ||
              (activeTab === "crew" && crewItems.length === 0)) && (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  Không có dữ liệu{" "}
                  {activeTab === "cast" ? "diễn xuất" : "thành viên đoàn phim"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PersonDetailPage;
