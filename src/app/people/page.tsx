"use client";

import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import Container from "@/components/ui/Container";
import PeopleGrid from "@/components/people/PeopleGrid";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTmdbLanguageFromLanguage } from "@/constants/app.constants";

export interface PersonData {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: Array<{
    id: number;
    title?: string;
    name?: string;
    media_type: "movie" | "tv";
    poster_path: string | null;
  }>;
  popularity: number;
}

// TMDB API configuration
const TMDB_API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const PeoplePage = () => {
  const { language } = useLanguage();
  const [people, setPeople] = useState<PersonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPeople = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        const tmdbLanguage = getTmdbLanguageFromLanguage(language);

        const response = await fetch(
          `${TMDB_BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&language=${encodeURIComponent(
            tmdbLanguage
          )}&page=${pageNum}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data?.results) {
          if (reset || pageNum === 1) {
            setPeople(data.results);
          } else {
            setPeople((prev) => [...prev, ...data.results]);
          }

          setHasMore(pageNum < data.total_pages && pageNum < 10);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching people:", err);
        setError("Failed to load people. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [language]
  );

  useEffect(() => {
    fetchPeople(1, true);
  }, [fetchPeople]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPeople(nextPage, false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        <Container withHeaderOffset>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Actors & Directors
            </h1>
            <p className="text-gray-400">
              Explore a whole world of actors and filmmakers
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <PeopleGrid
            people={people}
            loading={loading}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </Container>
      </div>
    </Layout>
  );
};

export default PeoplePage;
