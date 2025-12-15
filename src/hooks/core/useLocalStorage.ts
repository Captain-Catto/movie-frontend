import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing state synchronized with localStorage
 * Provides type-safe localStorage access with automatic JSON serialization
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist in localStorage
 * @returns [storedValue, setValue, removeValue] - Similar to useState but synced with localStorage
 * 
 * @example
 * ```tsx
 * function UserPreferences() {
 *   const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'dark');
 *   const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('searches', []);
 * 
 *   return (
 *     <div>
 *       <button onClick={() => setTheme('light')}>Light Theme</button>
 *       <button onClick={() => setTheme('dark')}>Dark Theme</button>
 *       <button onClick={removeTheme}>Reset Theme</button>
 *       
 *       <p>Recent: {recentSearches.join(', ')}</p>
 *       <button onClick={() => setRecentSearches([...recentSearches, 'new search'])}>
 *         Add Search
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        // Key was removed
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
