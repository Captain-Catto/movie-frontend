"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFavorites, clearFavorites } from "@/store/favoritesSlice";

/**
 * Component to automatically load favorites when user logs in
 * and clear them when user logs out
 */
export function FavoritesLoader() {
  const { isLoading, token, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Wait until auth finishes initializing
    if (isLoading) return;

    // If we have a token (even if isAuthenticated hasn't flipped yet), try load favorites
    if (token) {
      console.log(
        "[FavoritesLoader] Token detected, requesting favorites...",
        { isAuthenticated }
      );
      // Load favorites when user is authenticated (only once per session change)
      if (!hasFetched.current) {
        dispatch(fetchFavorites());
        hasFetched.current = true;
      }
    } else {
      console.log("[FavoritesLoader] No token, clearing favorites.");
      // Clear favorites when user logs out
      dispatch(clearFavorites());
      hasFetched.current = false;
    }
  }, [isAuthenticated, isLoading, token, dispatch]);
  return null; // This component doesn't render anything
}
