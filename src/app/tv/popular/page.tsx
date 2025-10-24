"use client";

import { Suspense } from "react";
import TvCategoryPage from "@/components/tv/TvCategoryPage";

export default function PopularTVPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-white">
          Đang tải danh sách phim bộ...
        </div>
      }
    >
      <TvCategoryPage
        category="popular"
        title="Popular TV Shows"
        description="Discover the TV shows audiences are watching and talking about the most."
      />
    </Suspense>
  );
}
