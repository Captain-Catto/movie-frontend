"use client";

import { Suspense } from "react";
import TvCategoryPage from "@/components/tv/TvCategoryPage";
import PageSkeleton from "@/components/ui/PageSkeleton";

export default function PopularTVPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton title="Popular TV Shows" items={18} />
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
