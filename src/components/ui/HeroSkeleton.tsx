'use client';

import React from 'react';
import Skeleton from './Skeleton';

const HeroSkeleton = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Skeleton */}
      <div className="absolute inset-0">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-transparent" />
      </div>

      {/* Content Skeleton */}
      <div className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-12">
        <div className="max-w-2xl space-y-8">
          {/* Title Skeleton */}
          <div>
            <Skeleton className="h-12 w-80 sm:w-96 mb-4" />
            <div className="flex items-center flex-wrap gap-3 text-sm mb-4">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>

          {/* Genres Skeleton */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>

          {/* Description Skeleton */}
          <div className="space-y-3 max-w-3xl">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Buttons Skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-12 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Scene Thumbnails Skeleton */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="w-24 h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSkeleton;
