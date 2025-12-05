"use client";

import { Suspense } from "react";
import TvCategoryPage from "@/components/tv/TvCategoryPage";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { SKELETON_COUNT_TV } from "@/constants/app.constants";

export default function TopRatedTVPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton title="Top Rated TV Shows" items={SKELETON_COUNT_TV} />
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
