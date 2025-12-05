import { Star } from "lucide-react";

interface MovieInfoProps {
  title: string;
  rating: number;
  year: number;
  duration: string;
  season?: string;
  episode?: string;
  genres: string[];
}

const MovieInfo = ({ title, rating, year, duration, season, episode, genres }: MovieInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-5xl font-bold mb-4 text-white">{title}</h1>
        <div className="flex items-center space-x-4 text-sm">
          {rating && parseFloat(String(rating)) > 0 && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="ml-1 text-white">{rating}</span>
            </div>
          )}
          <span className="text-white">{year}</span>
          <div className="flex items-center text-gray-400">
            <div className="w-4 h-4 border-2 border-current rounded-full relative mr-1">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-2 bg-current origin-bottom"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-current"></div>
            </div>
            <span>{duration}</span>
          </div>
          {season && (
            <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-md">
              {season}
            </span>
          )}
          {episode && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-md">
              {episode}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {genres.map((genre, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-800/50 backdrop-blur-sm rounded-full text-sm hover:bg-gray-700/50 transition-colors cursor-pointer text-white"
          >
            {genre}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MovieInfo;