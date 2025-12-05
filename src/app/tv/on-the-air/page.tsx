"use client";

import { Suspense } from "react";
import TvCategoryPage from "@/components/tv/TvCategoryPage";
import PageSkeleton from "@/components/ui/PageSkeleton";

export default function OnTheAirTVPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton title="Currently Airing TV Shows" items={18} />
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
