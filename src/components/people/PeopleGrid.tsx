"use client";

import PersonCard from "./PersonCard";
import PersonCardSkeleton from "@/components/ui/PersonCardSkeleton";
import type { PersonData } from "@/types/people.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPeopleUiMessages } from "@/lib/ui-messages";

interface PeopleGridProps {
  people: PersonData[];
  loading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const PeopleGrid = ({
  people,
  loading,
  onLoadMore,
  hasMore,
}: PeopleGridProps) => {
  const { language } = useLanguage();
  const labels = getPeopleUiMessages(language);

  return (
    <div className="space-y-8">
      {/* People Grid */}
      <div className="flex flex-wrap justify-center -mx-2">
        {people.map((person) => (
          <div key={person.id} className="px-2 mb-4 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6">
            <PersonCard person={person} />
          </div>
        ))}

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 12 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="px-2 mb-4 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6">
              <PersonCardSkeleton />
            </div>
          ))
        }
      </div>

      {/* Empty state */}
      {!loading && people.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">
              {labels.noActorsFound}
            </h3>
            <p>
              {labels.actorsListEmpty}
            </p>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && people.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            {labels.loadMore}
          </button>
        </div>
      )}
    </div>
  );
};

export default PeopleGrid;
