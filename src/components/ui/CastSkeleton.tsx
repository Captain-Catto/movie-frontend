'use client';

import React from 'react';
import Skeleton from './Skeleton';

const CastSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="text-center">
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <Skeleton className="w-full h-full" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  );
};

export default CastSkeleton;