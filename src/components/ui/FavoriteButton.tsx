"use client";
import React from "react";
// import { showErrorToast, showSuccessToast, showInfoToast } from "@/utils/errorHandler";
// import { toast } from "sonner";
// import { useAuth } from "@/hooks/useAuth";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import {
//   toggleFavoriteAsync,
//   fetchFavoritesAsync,
//   selectIsFavorited,
//   selectFavoritesLoading,
// } from "@/store/slices/favoritesSlices";

export interface FavoriteItem {
  id: string;
  type?: "movie" | "tv-show";
  title: string;
  year?: number;
  genres?: string[];
  rating?: number;
  image?: string;
  slug?: string;
}

interface FavoriteButtonProps {
  item: FavoriteItem;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function FavoriteButton({
  item,
  className = "",
  size = "md",
}: FavoriteButtonProps) {
  // For now, we'll use local state until Redux is set up
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const isAuthenticated = true; // Mock authentication for now

  // Uncomment when Redux is ready
  // const { isAuthenticated } = useAuth();
  // const dispatch = useAppDispatch();
  // const isFavorited = useAppSelector(selectIsFavorited(item.id));
  // const isLoading = useAppSelector(selectFavoritesLoading);

  const handleToggle = async (e?: React.MouseEvent) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Validation
    if (!item?.id) {
      console.error("Thông tin phim không hợp lệ");
      // showErrorToast("Thông tin phim không hợp lệ", "Không thể thực hiện thao tác này");
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      console.error("Bạn cần đăng nhập để sử dụng tính năng này");
      // showErrorToast("Bạn cần đăng nhập để sử dụng tính năng này", "Vui lòng đăng nhập để lưu phim");
      return;
    }

    try {
      setIsLoading(true);

      // Show loading toast
      // const loadingToast = toast.loading(
      //   isFavorited
      //     ? "Đang xóa khỏi danh sách yêu thích..."
      //     : "Đang thêm vào danh sách yêu thích..."
      // );

      // Mock API call for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsFavorited(!isFavorited);

      // Uncomment when Redux is ready
      // const result = await dispatch(toggleFavoriteAsync(item.id));
      // toast.dismiss(loadingToast);

      // if (toggleFavoriteAsync.fulfilled.match(result)) {
      //   const { action } = result.payload;
      //
      //   if (action === "removed") {
      //     showSuccessToast("Đã xóa khỏi danh sách yêu thích");
      //   } else if (action === "added") {
      //     showSuccessToast("Đã thêm vào danh sách yêu thích");
      //     dispatch(fetchFavoritesAsync(true));
      //   } else if (action === "already_exists") {
      //     showInfoToast("Phim này đã có trong danh sách yêu thích");
      //     dispatch(fetchFavoritesAsync(false));
      //   }
      // } else {
      //   const errorMessage = result.payload as string;
      //   showErrorToast(errorMessage, "Không thể thực hiện thao tác");
      // }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // showErrorToast(error, "Không thể thực hiện thao tác");
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={` ${
        isFavorited
          ? "bg-red-500 text-white hover:bg-red-600 shadow-lg"
          : "bg-gray-600/80 text-white hover:bg-gray-500/80"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={isFavorited ? "Bỏ lưu phim" : "Lưu phim"}
      data-item-id={item.id}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
      </svg>
    </button>
  );
}
