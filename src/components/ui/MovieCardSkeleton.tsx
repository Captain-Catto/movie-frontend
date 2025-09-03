'use client';

import React from 'react';
import Skeleton from './Skeleton';

const MovieCardSkeleton = () => {
  return (
    <div className="sw-item group relative">
      <div className="v-thumbnail block">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
          {/* Poster Skeleton */}
          <Skeleton className="absolute inset-0" />
          
          {/* Favorite Button Skeleton */}
          <div className="absolute top-2 right-2">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Movie Info Skeleton */}
      <div className="info mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
};

export default MovieCardSkeleton;