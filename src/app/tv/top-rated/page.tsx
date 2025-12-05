"use client";

import { Suspense } from "react";
import TvCategoryPage from "@/components/tv/TvCategoryPage";
import PageSkeleton from "@/components/ui/PageSkeleton";

export default function TopRatedTVPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton title="Top Rated TV Shows" items={18} />
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
