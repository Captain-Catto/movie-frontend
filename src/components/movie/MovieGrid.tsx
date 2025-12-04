import MovieCard, { MovieCardData } from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

interface MovieGridProps {
  movies: MovieCardData[];
  title?: string;
  showFilters?: boolean;
  maxRows?: number;
  containerPadding?: boolean;
  loading?: boolean;
}

const MovieGrid = ({
  movies,
  title,
  showFilters = true,
  maxRows,
  containerPadding = true,
  loading = false
}: MovieGridProps) => {
  // Limit movies to 6 per row if maxRows is 1
  const displayMovies = maxRows === 1 ? movies.slice(0, 6) : movies;
  const skeletonCount = maxRows === 1 ? 6 : 12;

  return (
    <div className={containerPadding ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" : ""}>
      {(title || showFilters) && (
        <div className="flex items-center justify-between mb-8">
          {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
          {showFilters && (
            <div className="flex space-x-4">
              <button className="flex items-center space-x-2 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
                <span>Trending</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Latest</span>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: skeletonCount }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))
        ) : (
          displayMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        )}
      </div>
    </div>
  );
};

export default MovieGrid;
