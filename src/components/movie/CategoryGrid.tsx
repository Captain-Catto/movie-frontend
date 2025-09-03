'use client';

import { useLoading } from '@/hooks/useLoading';
import CategoryGridSkeleton from '@/components/ui/CategoryGridSkeleton';

interface Category {
  id: string;
  name: string;
  backgroundImage: string;
}

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  const { isLoading } = useLoading({ delay: 1500 });

  if (isLoading) {
    return <CategoryGridSkeleton />;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl font-bold mb-8 text-white">Popular Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative h-40 rounded-lg overflow-hidden cursor-pointer group"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110"
              style={{
                backgroundImage: `url('${category.backgroundImage}')`,
              }}
            >
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors"></div>
            </div>
            <div className="relative h-full flex items-center justify-center">
              <span className="text-xl font-semibold text-white">{category.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;