'use client';

import Link from 'next/link';
import FavoriteButton from '@/components/ui/FavoriteButton';
import HeroSkeleton from '@/components/ui/HeroSkeleton';
import { useLoading } from '@/hooks/useLoading';

interface HeroSectionProps {
  movies: Array<{
    id: string;
    title: string;
    aliasTitle: string;
    rating: number;
    year: number;
    duration: string;
    season: string;
    episode: string;
    genres: string[];
    description: string;
    backgroundImage: string;
    posterImage: string;
    scenes: string[];
  }>;
}

const HeroSection = ({ movies }: HeroSectionProps) => {
  const { isLoading } = useLoading({ delay: 1200 });
  
  // Use first movie for now (can be extended for carousel later)
  const movie = movies[0];
  
  if (!movie || isLoading) return <HeroSkeleton />;

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${movie.backgroundImage}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl space-y-8">
          {/* Title and Info */}
          <div>
            <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
            <div className="flex items-center space-x-4 text-sm">
              {/* Rating */}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-yellow-500 fill-current">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span className="ml-1">{movie.rating}</span>
              </div>
              
              {/* Year */}
              <span>{movie.year}</span>
              
              {/* Duration */}
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span className="ml-1">{movie.duration}</span>
              </div>
              
              {/* Season */}
              <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-md">{movie.season}</span>
              
              {/* Episode */}
              <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-md">{movie.episode}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre, index) => (
              <Link key={index} href={`/genre/${genre}`}>
                <span className="px-3 py-1 bg-gray-800/50 backdrop-blur-sm rounded-full text-sm hover:bg-gray-700/50 transition-colors cursor-pointer">
                  {genre}
                </span>
              </Link>
            ))}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg leading-relaxed">
            {movie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Link href={`/movie/${movie.id}`}>
              <button className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-xl font-semibold flex items-center space-x-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Xem Phim</span>
              </button>
            </Link>
            <FavoriteButton 
              item={{ id: movie.id, title: movie.title }}
              size="lg"
              className="px-8 py-4 rounded-xl font-semibold"
            />
            <button className="px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm rounded-xl font-semibold transition-colors">
              Chi Tiết
            </button>
          </div>
        </div>

        {/* Scene Thumbnails - Bottom Right */}
        <div className="absolute bottom-8 right-8">
          <div className="flex space-x-2">
            {movie.scenes.slice(0, 6).map((scene, index) => (
              <div key={index} className="w-24 h-16 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105">
                <img 
                  src={scene} 
                  alt={`Scene ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;