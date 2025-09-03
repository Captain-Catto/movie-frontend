'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />
  );
};

export default Skeleton;