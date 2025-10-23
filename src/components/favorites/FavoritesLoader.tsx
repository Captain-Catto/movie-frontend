"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFavorites, clearFavorites } from "@/store/favoritesSlice";

/**
 * Component to automatically load favorites when user logs in
 * and clear them when user logs out
 */
export function FavoritesLoader() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Load favorites when user is authenticated
      dispatch(fetchFavorites());
    } else if (!isAuthenticated && !isLoading) {
      // Clear favorites when user logs out
      dispatch(clearFavorites());
    }
  }, [isAuthenticated, isLoading, dispatch]);
  return null; // This component doesn't render anything
}
