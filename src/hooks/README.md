# Hooks Directory Structure

This directory contains all custom React hooks organized by category for better maintainability.

## 📁 Folder Structure

```
src/hooks/
├── core/              # Core utility hooks (NEW ✨)
│   ├── useAsyncQuery.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── usePagination.ts
│   └── index.ts
│
├── state/             # State management hooks (NEW ✨)
│   ├── useAuth.ts
│   ├── useFavorites.ts
│   └── index.ts
│
├── data/              # Data fetching hooks (PLANNED)
│   ├── useMoviesList.ts
│   ├── useTVSeriesList.ts
│   ├── useContentDetail.ts
│   └── index.ts
│
├── pages/             # Page-specific hooks (NEW ✨)
│   ├── useHomePage.ts
│   ├── useBrowsePage.ts
│   ├── useMovieDetailPage.ts
│   ├── useFavoritesPage.ts
│   └── index.ts
│
├── components/        # Component-specific hooks (NEW ✨)
│   ├── useMovieCard.ts
│   ├── useHeroSection.ts
│   ├── useMovieFilters.ts
│   └── index.ts
│
└── (legacy files)     # Existing hooks to be refactored
    ├── useMovieCategory.ts
    ├── useSearch.ts
    ├── useRecentSearches.ts
    ├── use-comments.ts
    ├── useNotificationSocket.ts
    ├── useIntersectionObserver.ts
    ├── useClickOutside.ts
    ├── useWindowWidth.ts
    └── ...
```

---

## ✨ New Hooks (Phase 1 - COMPLETED)

### Core Hooks (`hooks/core/`)

#### `useAsyncQuery<T>(options)`
Generic hook for handling async operations with loading/error states.

```tsx
const { data, loading, error, refetch } = useAsyncQuery({
  queryFn: async () => await apiService.getMovies(),
  dependencies: [page, genre],
  onSuccess: (data) => console.log('Loaded:', data)
});
```

#### `useDebounce<T>(value, delay)`
Debounce value changes to prevent excessive updates.

```tsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 600);

useEffect(() => {
  if (debouncedSearch) {
    fetchResults(debouncedSearch);
  }
}, [debouncedSearch]);
```

#### `useLocalStorage<T>(key, initialValue)`
Type-safe localStorage with automatic JSON serialization.

```tsx
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'dark');
const [searches, setSearches] = useLocalStorage<string[]>('searches', []);
```

#### `usePagination(options)`
URL-based pagination with Next.js router.

```tsx
const { page, goToPage, nextPage, prevPage, isFirstPage } = usePagination({
  basePath: '/movies'
});
```

### State Hooks (`hooks/state/`)

#### `useAuth()`
Simplified wrapper around Redux auth state.

```tsx
const { user, isAuthenticated, login, logout, isLoading } = useAuth();

const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) router.push('/');
};
```

#### `useFavorites()`
Simplified wrapper around Redux favorites state.

```tsx
const { isFavorite, toggleFavorite, count } = useFavorites();

const handleFavorite = async () => {
  await toggleFavorite(movie.id, movie.mediaType);
};
```

---

## ✨ New Hooks (Phase 2 - COMPLETED)

### Data Fetching Hooks (`hooks/data/`)

#### `useMoviesList(options)`
Fetch movies with filters and pagination. Automatically maps API data to frontend format.

```tsx
const { movies, loading, pagination, refetch } = useMoviesList({
  category: 'popular',  // 'now_playing' | 'popular' | 'top_rated' | 'upcoming' | 'all'
  page: 1,
  genre: '28',  // Action genre ID
  year: 2024,
});

if (loading) return <Skeleton />;
return <MovieGrid movies={movies} pagination={pagination} />;
```

#### `useTVSeriesList(options)`
Fetch TV series with filters and pagination.

```tsx
const { series, loading, pagination } = useTVSeriesList({
  category: 'popular',  // 'on_the_air' | 'popular' | 'top_rated' | 'all'
  page: 1,
  genre: '10765',  // Sci-Fi & Fantasy
});
```

#### `useContentDetail(options)`
Fetch complete detail page data (content + credits + recommendations + videos) in parallel.

```tsx
const { data, loading, error } = useContentDetail({
  id: parseInt(movieId),
  type: 'movie',  // or 'tv'
  fetchCredits: true,
  fetchRecommendations: true,
  fetchVideos: true,
});

if (!data) return null;
const { content, credits, recommendations, videos } = data;
```

### Refactored Hooks

#### `useSearch()` - Now uses `useDebounce()`
Search hook refactored to use our custom `useDebounce()` hook instead of manual debounce logic.

**Before:** 30+ lines of debounce logic with `useRef` and `setTimeout`
**After:** Clean 1-liner with `const debouncedQuery = useDebounce(query, 600);`

---

## ✨ New Hooks (Phase 3 - COMPLETED)

### Page Hooks (`hooks/pages/`)

Page hooks orchestrate entire page logic by composing multiple data and state hooks. They handle all data fetching, state management, and interactions for a specific page.

#### `useHomePage()`
Orchestrates the home page with hero section and multiple movie categories, featuring lazy loading and responsive limits.

```tsx
const { sections, responsiveLimit, refetchAll } = useHomePage();

// sections.hero - Trending movies for hero banner
// sections.nowPlaying - Now playing movies (lazy loaded)
// sections.popular - Popular movies (lazy loaded)
// sections.topRated - Top rated movies (lazy loaded)
// sections.upcoming - Upcoming movies (lazy loaded)

return (
  <>
    <HeroSection movies={sections.hero} />
    <MovieCarousel title="Now Playing" {...sections.nowPlaying} />
    <MovieCarousel title="Popular" {...sections.popular} />
    <MovieCarousel title="Top Rated" {...sections.topRated} />
    <MovieCarousel title="Upcoming" {...sections.upcoming} />
  </>
);
```

**Features:**
- Hero section loads immediately on mount
- Category sections lazy load as user scrolls (Intersection Observer)
- Responsive item limits based on screen breakpoint (4/8/10)
- Automatic data mapping from backend to frontend format

#### `useBrowsePage()`
Manages browse page with complex filters and URL synchronization.

```tsx
const {
  content,           // Current page items (movies or TV series)
  loading,
  page,
  totalPages,
  filters,           // Current filter state
  contentType,       // 'movie' | 'tv'
  updateFilter,      // Update a single filter
  clearFilters,      // Reset all filters
  goToPage,          // Navigate to page
  setContentType,    // Switch between movies/TV
} = useBrowsePage();

return (
  <>
    <ContentTypeTabs type={contentType} onChange={setContentType} />
    <FilterPanel filters={filters} onUpdate={updateFilter} onClear={clearFilters} />
    <MovieGrid content={content} />
    <Pagination page={page} total={totalPages} onPageChange={goToPage} />
  </>
);
```

**Features:**
- Support for both movies and TV series
- Multi-dimensional filtering (countries, genres, years, sort)
- All filter state synced with URL query params
- Pagination resets to page 1 when filters change
- Automatic fetch on filter/type/page change

#### `useMovieDetailPage(options)`
Fetches and processes all data needed for movie/TV detail page.

```tsx
const { data, loading, error, toggleFavorite } = useMovieDetailPage({
  id: parseInt(params.id),
  type: params.type as 'movie' | 'tv',
});

if (!data) return <Skeleton />;

const {
  content,          // Movie/TV data
  director,         // Extracted from crew
  country,          // First production country
  cast,             // Top 10 cast members
  runtime,          // Formatted runtime
  trailer,          // Official trailer video
  recommendations,  // Similar content
  isFavorited,      // Current favorite status
} = data;

return (
  <>
    <DetailHero content={content} director={director} onFavorite={toggleFavorite} />
    <CastSection cast={cast} />
    {trailer && <TrailerSection video={trailer} />}
    <RecommendationsSection items={recommendations} />
  </>
);
```

**Features:**
- Fetches all data in parallel (content, credits, videos, recommendations)
- Processes raw data into UI-ready format
- Extracts director from crew members
- Selects best trailer (prioritizes official trailers)
- Integrates favorites functionality
- Returns computed fields (runtime, country, etc.)

#### `useFavoritesPage(options)`
Manages favorites page with filtering, pagination, and removal actions.

```tsx
const {
  filteredItems,      // Current page items after filtering
  loading,
  page,
  totalPages,
  contentType,        // 'all' | 'movie' | 'tv'
  setContentType,     // Filter by content type
  removeFavorite,     // Remove single item
  clearAllFavorites,  // Clear all favorites
  isEmpty,            // No favorites exist
  totalCount,         // Total favorites count
  movieCount,         // Number of movies
  tvCount,            // Number of TV series
} = useFavoritesPage({ itemsPerPage: 24 });

if (isEmpty) return <EmptyState />;

return (
  <>
    <FavoritesHeader
      total={totalCount}
      movies={movieCount}
      tv={tvCount}
      onClearAll={clearAllFavorites}
    />
    <ContentTypeTabs type={contentType} onChange={setContentType} />
    <MovieGrid
      movies={filteredItems}
      onRemove={removeFavorite}
    />
    <Pagination page={page} total={totalPages} />
  </>
);
```

**Features:**
- Fetches full details for all favorited items in parallel
- Client-side filtering by content type (all/movie/tv)
- Client-side pagination for performance
- Graceful error handling for missing items
- Counts by content type for UI badges
- Optimistic updates when removing favorites

---

## ✨ New Hooks (Phase 4 - COMPLETED)

### Component Hooks (`hooks/components/`)

Component hooks extract business logic from specific UI components, making components purely presentational and easier to test.

#### `useMovieCard(options)`
Handles all MovieCard component logic including hover positioning, navigation, and data formatting.

```tsx
function MovieCard({ movie }: { movie: MovieCardData }) {
  const {
    cardRef,
    posterUrl,
    detailHref,
    watchHref,
    hoverPosition,
    handleHoverPosition,
    handleWatchClick,
    favoriteButtonData,
  } = useMovieCard({ movie });

  return (
    <div ref={cardRef} onMouseEnter={handleHoverPosition}>
      <Link href={detailHref}>
        <Image src={posterUrl} alt={movie.title} />
      </Link>
      <button onClick={handleWatchClick}>Watch</button>
      <FavoriteButton movie={favoriteButtonData} />
      <HoverPreviewCard placement={hoverPosition} />
    </div>
  );
}
```

**Features:**
- Content type detection (movie vs TV series) from href
- URL generation for detail and watch pages
- Hover card positioning based on viewport (prevents overflow)
- Poster fallback handling with multiple sources
- Favorite button data formatting
- Navigation handlers with proper event handling

#### `useHeroSection(options)`
Manages hero carousel/slider logic including Swiper controls, slide navigation, and data processing.

```tsx
function HeroSection({ movies }: { movies: MovieCardData[] }) {
  const {
    swiperRef,
    activeIndex,
    handleSlideChange,
    handleSwiperInit,
    thumbnailCount,
    handleThumbnailClick,
    processSlideData,
    getThumbnailImage,
  } = useHeroSection({ movies });

  return (
    <>
      <Swiper
        onSwiper={handleSwiperInit}
        onSlideChange={handleSlideChange}
      >
        {movies.map((movie) => {
          const data = processSlideData(movie);
          return (
            <SwiperSlide key={movie.id}>
              <Image src={data.backgroundImage} />
              <h1>{movie.title}</h1>
              {data.hasRating && <Rating value={data.displayRating} />}
              <Link href={data.watchHref}>Watch</Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Thumbnail Navigation */}
      <div>
        {movies.slice(0, thumbnailCount).map((movie, idx) => (
          <img
            key={movie.id}
            src={getThumbnailImage(movie)}
            onClick={() => handleThumbnailClick(idx)}
            className={activeIndex === idx ? 'active' : ''}
          />
        ))}
      </div>
    </>
  );
}
```

**Features:**
- Swiper instance management with refs
- Active slide tracking
- Responsive thumbnail counts (5/8/10 based on breakpoint)
- Rating normalization from multiple field formats
- Image fallback handling (background and poster)
- Content type detection and watch URL generation
- Thumbnail click navigation with smooth transitions

#### `useMovieFilters(options)`
Manages complex filter state with URL synchronization for browse pages.

```tsx
function BrowsePage() {
  const {
    filters,
    setGenres,
    setYears,
    setSortBy,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    updateUrlWithFilters,
    toApiQueryParams,
  } = useMovieFilters({ basePath: '/browse' });

  const handleGenreChange = (genres: string[]) => {
    setGenres(genres);
    updateUrlWithFilters({ ...filters, genres }, 1);
  };

  const fetchMovies = async (page: number) => {
    const apiParams = toApiQueryParams(page, 24);
    const response = await apiService.getMovies(apiParams);
    // ...
  };

  return (
    <>
      <FilterPanel
        filters={filters}
        onGenreChange={handleGenreChange}
        onYearChange={setYears}
        onSortChange={setSortBy}
      />

      {hasActiveFilters && (
        <button onClick={clearFilters}>
          Clear Filters ({activeFilterCount})
        </button>
      )}

      <MovieGrid movies={movies} />
    </>
  );
}
```

**Features:**
- Multi-dimensional filters (countries, genres, years, sort, type)
- URL query params parsing and synchronization
- Individual filter setters for granular control
- Bulk filter operations (update, clear, reset)
- Active filter tracking and counting
- API query params generation
- Filter validation
- Pagination integration with filters

---

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **Hooks** = Business logic (data fetching, state management, side effects)
- **Components** = UI rendering only

### 2. **Reusability**
- Each hook is designed to be used in multiple places
- Generic hooks accept options for flexibility

### 3. **Type Safety**
- Full TypeScript support with exported interfaces
- Generic types for flexible data handling

### 4. **Documentation**
- JSDoc comments with examples
- Clear parameter descriptions
- Usage examples in docstrings

---

## 📖 Usage Guide

### Importing Hooks

```tsx
// Import from category folders
import { useAsyncQuery, useDebounce, usePagination } from '@/hooks/core';
import { useAuth, useFavorites } from '@/hooks/state';

// Or import directly
import { useAsyncQuery } from '@/hooks/core/useAsyncQuery';
```

### Best Practices

1. **Use hooks for ALL business logic**
   ```tsx
   // ❌ BAD: Logic in component
   function MovieCard({ movie }) {
     const [loading, setLoading] = useState(false);
     const handleClick = async () => {
       setLoading(true);
       await apiService.addFavorite(movie.id);
       setLoading(false);
     };
   }

   // ✅ GOOD: Logic in hook
   function MovieCard({ movie }) {
     const { toggleFavorite, isLoading } = useFavorites();
     const handleClick = () => toggleFavorite(movie.id);
   }
   ```

2. **Compose hooks for complex logic**
   ```tsx
   function useMoviesPage() {
     const { page, goToPage } = usePagination({ basePath: '/movies' });
     const { data, loading } = useAsyncQuery({
       queryFn: () => apiService.getMovies({ page }),
       dependencies: [page]
     });

     return { movies: data, loading, page, goToPage };
   }
   ```

3. **Keep components pure and simple**
   ```tsx
   function MoviesPage() {
     const { movies, loading, page, goToPage } = useMoviesPage();

     if (loading) return <Skeleton />;
     return <MovieGrid movies={movies} onPageChange={goToPage} />;
   }
   ```

---

## 🔄 Migration Status

### ✅ Phase 1: Core Infrastructure (COMPLETED)
- [x] `useAsyncQuery()` - Generic async handler
- [x] `useDebounce()` - Debounce utility
- [x] `useLocalStorage()` - Storage management
- [x] `usePagination()` - Pagination logic
- [x] `useAuth()` - Auth wrapper
- [x] `useFavorites()` - Favorites wrapper

### ✅ Phase 2: Data Fetching Hooks (COMPLETED)
- [x] `useMoviesList()` - Fetch movies with filters
- [x] `useTVSeriesList()` - Fetch TV series
- [x] `useContentDetail()` - Fetch content details
- [x] Refactor `useSearch()` to use `useDebounce()`

### ✅ Phase 3: Page Hooks (COMPLETED)
- [x] `useHomePage()` - Home page data orchestration
- [x] `useBrowsePage()` - Browse page with filters
- [x] `useMovieDetailPage()` - Detail page data
- [x] `useFavoritesPage()` - Favorites page

### ✅ Phase 4: Component Hooks (COMPLETED)
- [x] `useMovieCard()` - MovieCard interactions
- [x] `useHeroSection()` - Hero carousel logic
- [x] `useMovieFilters()` - Filter state management

---

## 🧪 Testing

Each hook should be testable independently:

```tsx
// Example test for useDebounce
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/core';

test('debounces value changes', async () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 500),
    { initialProps: { value: 'initial' } }
  );

  expect(result.current).toBe('initial');

  rerender({ value: 'updated' });
  expect(result.current).toBe('initial'); // Still old value

  await act(() => new Promise(r => setTimeout(r, 600)));
  expect(result.current).toBe('updated'); // Updated after delay
});
```

---

## 📚 Resources

- [Refactoring Plan](../../../../../FRONTEND_HOOKS_REFACTORING_PLAN.md)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Last Updated:** 2025-12-15
**Version:** 4.0.0 (Phase 1, 2, 3 & 4 Complete) 🎉
