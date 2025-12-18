/**
 * State management hooks
 * Wrappers around Redux state for simplified API
 */

export { useAuth } from '../useAuth';
export type { UseAuthReturn } from '../useAuth';

export { useFavorites } from './useFavorites';
export type { UseFavoritesReturn, FavoriteItem } from './useFavorites';
