"use client";

import { Suspense } from "react";
import TvCategoryPage from "@/components/tv/TvCategoryPage";

export default function TopRatedTVPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-white">
          Loading TV series...
        </div>
      }
    >
      <TvCategoryPage
        category="top-rated"
        title="Top Rated TV Shows"
        description="Critically acclaimed series with outstanding ratings from viewers."
      />
    </Suspense>
  );
}
