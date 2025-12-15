import { useState, useEffect } from 'react';

/**
 * Hook that debounces a value - delays updating the value until after a specified delay
 * Useful for search inputs, preventing excessive API calls while user is typing
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearch = useDebounce(searchTerm, 600);
 * 
 *   // This effect only runs when user stops typing for 600ms
 *   useEffect(() => {
 *     if (debouncedSearch) {
 *       fetchSearchResults(debouncedSearch);
 *     }
 *   }, [debouncedSearch]);
 * 
 *   return (
 *     <input 
 *       value={searchTerm} 
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
