'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';

const FavoritesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');

  // Mock favorites data
  const favoriteMovies = [
    {
      id: '1',
      title: 'Dune: Part Two',
      year: 2024,
      genre: 'Sci-Fi',
      rating: 8.9,
      poster: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=800&q=80',
      href: '/movie/1'
    },
    {
      id: '2',
      title: 'Oppenheimer',
      year: 2023,
      genre: 'Drama',
      rating: 9.2,
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
      href: '/movie/2'
    },
    {
      id: '3',
      title: 'Poor Things',
      year: 2024,
      genre: 'Comedy',
      rating: 8.7,
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      href: '/movie/3'
    }
  ];

  // Mock recommended movies
  const recommendedMovies = [
    {
      id: '4',
      title: 'The Batman',
      year: 2024,
      genre: 'Action',
      rating: 8.5,
      poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=800&q=80',
      href: '/movie/4'
    },
    {
      id: '5',
      title: 'Inception',
      year: 2023,
      genre: 'Sci-Fi',
      rating: 9.0,
      poster: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=800&q=80',
      href: '/movie/5'
    },
    {
      id: '6',
      title: 'Avatar 3',
      year: 2024,
      genre: 'Fantasy',
      rating: 8.8,
      poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&q=80',
      href: '/movie/6'
    }
  ];

  const handleRemoveFavorite = (movieId: string) => {
    // Handle remove favorite logic here
    console.log('Remove favorite:', movieId);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-3xl font-bold mb-8 text-white">My Favorites</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Action">Action</option>
                <option value="Comedy">Comedy</option>
                <option value="Drama">Drama</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Fantasy">Fantasy</option>
              </select>
              <select
                className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Latest">Latest</option>
                <option value="Highest Rated">Highest Rated</option>
                <option value="Title A-Z">Title A-Z</option>
              </select>
            </div>
          </div>

          {/* Favorites Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteMovies.map((movie) => (
              <div key={movie.id} className="bg-gray-800 rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="relative aspect-[3/4]">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex space-x-2">
                        <a
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center space-x-2"
                          href={movie.href}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                          <span>Watch Now</span>
                        </a>
                        <button
                          onClick={() => handleRemoveFavorite(movie.id)}
                          className="p-2 rounded-lg transition-colors bg-red-500 text-white hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 fill-current">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold truncate text-white">{movie.title}</h3>
                    <div className="flex items-center text-yellow-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 fill-current">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span className="ml-1">{movie.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{movie.year}</span>
                    <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs">{movie.genre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-white">Recommended For You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedMovies.map((movie) => (
              <div key={movie.id} className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{movie.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">{movie.rating}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{movie.year}</span>
                    </div>
                    <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm">{movie.genre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FavoritesPage;