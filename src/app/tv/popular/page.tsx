"use client";

import { Suspense } from "react";
import TvCategoryPage from "@/components/tv/TvCategoryPage";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { SKELETON_COUNT_TV } from "@/constants/app.constants";

export default function PopularTVPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton title="Popular TV Shows" items={SKELETON_COUNT_TV} />
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
