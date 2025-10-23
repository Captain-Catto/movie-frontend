"use client";

import { useState, useEffect, useCallback } from "react";
import { RecentSearch } from "@/types/search";

interface User {
  id: string;
  email: string;
  // Add other user properties as needed
}

interface UseRecentSearchesReturn {
  searches: RecentSearch[];
  addSearch: (query: string, type: "movie" | "tv" | "all") => Promise<void>;
  removeSearch: (search: RecentSearch) => Promise<void>;
  clearSearches: () => Promise<void>;
  syncSearches: () => Promise<void>;
}

const LOCAL_STORAGE_KEY = "recentSearches";
const MAX_LOCAL_SEARCHES = 10;

export const useRecentSearches = (
  user: User | null
): UseRecentSearchesReturn => {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  // Load searches from localStorage
  const loadLocalSearches = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const localSearches = JSON.parse(stored) as RecentSearch[];
        // Convert timestamp strings back to Date objects
        const parsedSearches = localSearches.map((search) => ({
          ...search,
          timestamp: new Date(search.timestamp),
          source: "local" as const,
        }));
        setSearches(parsedSearches);
      }
    } catch (error) {
      console.error("Error loading local searches:", error);
      setSearches([]);
    }
  }, []);

  // Load searches from database (when user is logged in)
  const loadUserSearches = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/search/recent");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          interface DbSearch {
            id?: string;
            query: string;
            type: "movie" | "tv" | "all";
            createdAt: string;
          }
          const dbSearches = data.data.map((search: DbSearch) => ({
            ...search,
            timestamp: new Date(search.createdAt),
            source: "database" as const,
          }));

          // Merge with local searches if any
          const localSearches = getLocalSearchesSync();
          const merged = mergeSearches(localSearches, dbSearches);
          setSearches(merged);

          // Sync merged searches back to database
          if (localSearches.length > 0) {
            await syncLocalToDatabase(localSearches);
          }
        }
      } else {
        // Fallback to local searches if API fails
        loadLocalSearches();
      }
    } catch (error) {
      console.error("Error loading user searches:", error);
      loadLocalSearches();
    }
  }, [loadLocalSearches]);

  // Load searches on mount and when user changes
  useEffect(() => {
    if (user) {
      loadUserSearches();
    } else {
      loadLocalSearches();
    }
  }, [user, loadUserSearches, loadLocalSearches]);

  // Get local searches synchronously
  const getLocalSearchesSync = (): RecentSearch[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const localSearches = JSON.parse(stored) as RecentSearch[];
        return localSearches.map((search) => ({
          ...search,
          timestamp: new Date(search.timestamp),
          source: "local" as const,
        }));
      }
    } catch (error) {
      console.error("Error getting local searches:", error);
    }
    return [];
  };

  // Merge local and database searches, removing duplicates
  const mergeSearches = (
    local: RecentSearch[],
    database: RecentSearch[]
  ): RecentSearch[] => {
    const merged = [...database];

    // Add local searches that don't exist in database
    local.forEach((localSearch) => {
      const exists = database.some(
        (dbSearch) =>
          dbSearch.query.toLowerCase() === localSearch.query.toLowerCase() &&
          dbSearch.type === localSearch.type
      );

      if (!exists) {
        merged.push(localSearch);
      }
    });

    // Sort by timestamp (newest first) and limit
    return merged
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 20);
  };

  // Sync local searches to database
  const syncLocalToDatabase = async (localSearches: RecentSearch[]) => {
    try {
      for (const search of localSearches) {
        await fetch("http://localhost:8080/api/search/recent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: search.query,
            type: search.type,
          }),
        });
      }

      // Clear local storage after successful sync
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error("Error syncing searches to database:", error);
    }
  };

  // Save search to localStorage
  const saveToLocalStorage = (searches: RecentSearch[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Add new search
  const addSearch = useCallback(
    async (query: string, type: "movie" | "tv" | "all") => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery || trimmedQuery.length < 2) return;

      const newSearch: RecentSearch = {
        query: trimmedQuery,
        type,
        timestamp: new Date(),
        source: user ? "database" : "local",
      };

      if (user) {
        // Save to database
        try {
          const response = await fetch(
            "http://localhost:8080/api/search/recent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: trimmedQuery,
                type,
              }),
            }
          );

          if (response.ok) {
            // Reload searches from database
            await loadUserSearches();
          } else {
            // Fallback to local storage
            const updatedSearches = addSearchToList(
              searches,
              newSearch,
              MAX_LOCAL_SEARCHES
            );
            setSearches(updatedSearches);
            saveToLocalStorage(updatedSearches);
          }
        } catch (error) {
          console.error("Error saving search to database:", error);
          // Fallback to local storage
          const updatedSearches = addSearchToList(
            searches,
            newSearch,
            MAX_LOCAL_SEARCHES
          );
          setSearches(updatedSearches);
          saveToLocalStorage(updatedSearches);
        }
      } else {
        // Save to localStorage
        const updatedSearches = addSearchToList(
          searches,
          newSearch,
          MAX_LOCAL_SEARCHES
        );
        setSearches(updatedSearches);
        saveToLocalStorage(updatedSearches);
      }
    },
    [user, searches, loadUserSearches]
  );

  // Helper function to add search to list
  const addSearchToList = (
    currentSearches: RecentSearch[],
    newSearch: RecentSearch,
    maxItems: number
  ): RecentSearch[] => {
    // Remove existing search with same query and type
    const filtered = currentSearches.filter(
      (s) =>
        !(
          s.query.toLowerCase() === newSearch.query.toLowerCase() &&
          s.type === newSearch.type
        )
    );

    // Add new search at the beginning and limit
    return [newSearch, ...filtered].slice(0, maxItems);
  };

  // Remove search
  const removeSearch = useCallback(
    async (searchToRemove: RecentSearch) => {
      if (user && searchToRemove.id) {
        // Remove from database
        try {
          const response = await fetch(
            `http://localhost:8080/api/search/recent/${searchToRemove.id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            setSearches((prev) =>
              prev.filter((s) => s.id !== searchToRemove.id)
            );
          }
        } catch (error) {
          console.error("Error removing search from database:", error);
        }
      } else {
        // Remove from localStorage
        const updatedSearches = searches.filter(
          (s) =>
            !(
              s.query === searchToRemove.query && s.type === searchToRemove.type
            )
        );
        setSearches(updatedSearches);
        saveToLocalStorage(updatedSearches);
      }
    },
    [user, searches]
  );

  // Clear all searches
  const clearSearches = useCallback(async () => {
    if (user) {
      // Clear from database
      try {
        const response = await fetch(
          "http://localhost:8080/api/search/recent",
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setSearches([]);
        }
      } catch (error) {
        console.error("Error clearing searches from database:", error);
      }
    } else {
      // Clear from localStorage
      setSearches([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user]);

  // Sync searches (mainly for debugging/manual sync)
  const syncSearches = useCallback(async () => {
    if (user) {
      await loadUserSearches();
    } else {
      loadLocalSearches();
    }
  }, [user, loadUserSearches, loadLocalSearches]);

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
    syncSearches,
  };
};

// Utility function to clear localStorage on logout
export const clearSearchStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};
