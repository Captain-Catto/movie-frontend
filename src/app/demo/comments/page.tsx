// Demo page for testing the comment system
// This demonstrates how to integrate the comment system into movie/TV pages

'use client';

import React from 'react';
import { CommentSection } from '@/components/comments';

export default function CommentDemo() {
  // Mock movie data for testing
  const movieId = 123;
  const movieTitle = "The Dark Knight";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Mock Movie Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {movieTitle}
        </h1>
        <p className="text-gray-600">
          This is a demo page to showcase the comment system. 
          The comments below are connected to movie ID: {movieId}
        </p>
      </div>

      {/* Comment System */}
      <CommentSection 
        movieId={movieId}
        className="bg-white"
      />
    </div>
  );
}