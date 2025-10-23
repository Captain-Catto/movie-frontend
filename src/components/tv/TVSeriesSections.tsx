"use client";
import { useState, useEffect } from "react";
import MovieGrid from "@/components/movie/MovieGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import { apiService } from "@/services/api";
import { mapTVSeriesToFrontend } from "@/utils/tvMapper";

export default function TVSeriesSections() {
  const [onTheAirTVSeries, setOnTheAirTVSeries] = useState<any[]>([]);
  const [popularTVSeries, setPopularTVSeries] = useState<any[]>([]);
  const [topRatedTVSeries, setTopRatedTVSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTVSectionData = async () => {
      try {
        setLoading(true);

        // Fetch TV categories in parallel (excluding airing today)
        const [onTheAirRes, popularRes, topRatedRes] = await Promise.all([
          apiService.getOnTheAirTVSeries({
            page: 1,
            limit: 6,
            language: "en-US",
          }),
          apiService.getPopularTVSeries({
            page: 1,
            limit: 6,
            language: "en-US",
          }),
          apiService.getTopRatedTVSeries({
            page: 1,
            limit: 6,
            language: "en-US",
          }),
        ]);

        if (onTheAirRes.success && onTheAirRes.data) {
          const mappedTVSeries = onTheAirRes.data.map((tv: any) =>
            mapTVSeriesToFrontend(tv)
          );
          setOnTheAirTVSeries(mappedTVSeries);
        }

        if (popularRes.success && popularRes.data) {
          const mappedTVSeries = popularRes.data.map((tv: any) =>
            mapTVSeriesToFrontend(tv)
          );
          setPopularTVSeries(mappedTVSeries);
        }

        if (topRatedRes.success && topRatedRes.data) {
          const mappedTVSeries = topRatedRes.data.map((tv: any) =>
            mapTVSeriesToFrontend(tv)
          );
          setTopRatedTVSeries(mappedTVSeries);
        }
      } catch (error) {
        console.error("❌ Error fetching TV series data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTVSectionData();
  }, []);

  // Fallback data in case API fails
  const fallbackTVSeries = [
    {
      id: "1",
      title: "Stranger Things",
      aliasTitle: "Stranger Things",
      poster:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=500&q=80",
      href: "/tv/1",
      year: 2024,
      genre: "Sci-Fi",
    },
    {
      id: "2",
      title: "The Crown",
      aliasTitle: "The Crown",
      poster:
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=500&q=80",
      href: "/tv/2",
      year: 2024,
      genre: "Drama",
    },
    {
      id: "3",
      title: "Wednesday",
      aliasTitle: "Wednesday",
      poster:
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=500&q=80",
      href: "/tv/3",
      year: 2024,
      genre: "Comedy",
    },
  ];

  // Use API data if available, otherwise use fallback
  const onTheAirToDisplay =
    onTheAirTVSeries.length > 0 ? onTheAirTVSeries : fallbackTVSeries;
  const popularToDisplay =
    popularTVSeries.length > 0 ? popularTVSeries : fallbackTVSeries;
  const topRatedToDisplay =
    topRatedTVSeries.length > 0 ? topRatedTVSeries : fallbackTVSeries;

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-8 bg-gray-700 rounded mb-6 w-48 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-gray-700 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* On The Air Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="On The Air" href="/tv/on-the-air" />
          <MovieGrid
            movies={onTheAirToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Popular TV Series Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Popular TV Series" href="/tv/popular" />
          <MovieGrid
            movies={popularToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>

      {/* Top Rated TV Series Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Top Rated TV Series" href="/tv/top-rated" />
          <MovieGrid
            movies={topRatedToDisplay}
            showFilters={false}
            maxRows={1}
            containerPadding={false}
          />
        </div>
      </div>
    </div>
  );
}
