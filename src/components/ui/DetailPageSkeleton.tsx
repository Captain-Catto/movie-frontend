'use client';

import React from 'react';
import Skeleton from './Skeleton';
import CastSkeleton from './CastSkeleton';
import EpisodesSkeleton from './EpisodesSkeleton';

const DetailPageSkeleton = ({ isTV = false }: { isTV?: boolean }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section Skeleton */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          <Skeleton className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl space-y-8">
            {/* Title and Metadata Skeleton */}
            <div>
              <Skeleton className="h-12 w-96 mb-4" />
              <div className="flex items-center space-x-4 text-sm mb-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            </div>

            {/* Genres Skeleton */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-20 rounded-full" />
              ))}
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Buttons Skeleton */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-32 rounded-xl" />
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-12 w-24 rounded-xl" />
            </div>
          </div>

          {/* Scene Thumbnails Skeleton */}
          <div className="absolute bottom-8 right-8">
            <div className="flex space-x-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="w-24 h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Cast Section Skeleton */}
        <div>
          <Skeleton className="h-8 w-32 mb-8" />
          <CastSkeleton />
        </div>

        {/* Episodes/Related Content Section Skeleton */}
        {isTV ? (
          <div>
            <Skeleton className="h-8 w-48 mb-8" />
            <EpisodesSkeleton />
          </div>
        ) : (
          <div>
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="sw-item group relative">
                  <div className="v-thumbnail block">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                      <Skeleton className="absolute inset-0" />
                    </div>
                  </div>
                  <div className="info mt-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info Section Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPageSkeleton;