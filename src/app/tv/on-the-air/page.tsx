"use client";

import { Suspense } from "react";
import TvCategoryPage from "@/components/tv/TvCategoryPage";

export default function OnTheAirTVPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-white">
          Đang tải danh sách phim bộ...
        </div>
      }
    >
      <TvCategoryPage
        category="on-the-air"
        title="Currently Airing TV Shows"
        description="Stay current with series that are actively broadcasting new episodes."
      />
    </Suspense>
  );
}
