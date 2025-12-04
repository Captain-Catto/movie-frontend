import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const MovieCardSkeleton = () => {
  return (
    <div className="group relative transition-all duration-300 hover:scale-105">
      <div className="relative overflow-hidden rounded-lg bg-gray-800/50">
        {/* Poster skeleton */}
        <div className="aspect-[2/3] w-full">
          <Skeleton
            height="100%"
            baseColor="#1f2937"
            highlightColor="#374151"
            className="h-full"
          />
        </div>

        {/* Rating badge skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton
            width={40}
            height={24}
            baseColor="#1f2937"
            highlightColor="#374151"
            borderRadius={12}
          />
        </div>
      </div>

      {/* Movie info skeleton */}
      <div className="mt-3 space-y-2">
        {/* Title skeleton */}
        <Skeleton
          width="80%"
          height={20}
          baseColor="#1f2937"
          highlightColor="#374151"
        />

        {/* Subtitle skeleton */}
        <Skeleton
          width="60%"
          height={16}
          baseColor="#1f2937"
          highlightColor="#374151"
        />
      </div>
    </div>
  );
};

export default MovieCardSkeleton;
