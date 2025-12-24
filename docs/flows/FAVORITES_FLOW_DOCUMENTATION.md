# Favorites Feature Flows

End-to-end flows for the favorites system (frontend + backend).

## Scope and files

- Backend: `movie-backend/src/controllers/favorite.controller.ts`, `src/services/favorite.service.ts`, `src/entities/favorite.entity.ts`
- Frontend: `movie-frontend/movie-app/src/services/favorites.service.ts`, `src/store/favoritesSlice.ts`, components that use it (e.g., `components/favorites/FavoriteButton.tsx`, movie cards, favorites page)

## Flows

### Add / Remove (toggle)
1) User taps favorite button.
2) UI dispatches optimistic toggle (Redux `favoriteIds` updates immediately).
3) Async thunk calls service:
   - Try `POST /favorites` with `contentId`, `contentType`.
   - If API returns “already exists”, fall back to `DELETE /favorites`.
4) On success, keep state; on failure, revert optimistic toggle and surface error.

### Load favorites
1) On authenticated entry (e.g., app load or favorites page), dispatch `fetchFavorites`.
2) Service calls `GET /favorites?page=1&limit=1000`.
3) Transform snake_case to frontend shape, map genre IDs to names.
4) Store `favoriteIds` and list for the favorites page.

### Check favorite status
1) Components read `favoriteIds` from Redux.
2) `isFavorite = favoriteIds.includes(contentId)` drives button state.

### Error handling and consistency
- Optimistic update is reverted on API error.
- On logout, `clearFavorites` resets state.
- Use token from `authStorage` via Axios interceptors.

## API contract (backend)

- `GET /favorites` → `{ favorites: [...], total, page, totalPages, hasMore }`
- `POST /favorites` → body `{ contentId, contentType }`
- `DELETE /favorites` → body `{ contentId, contentType }`

Notes:
- `contenttype` and `genreids` from backend are transformed client-side.
- `contenttype` maps to `media_type` (`movie` | `tv`).

## Implementation details

### Frontend service (`favorites.service.ts`)
- `getUserFavorites()`: fetch and transform data, map genres.
- `addToFavorites()` / `removeFromFavorites()` / `toggleFavorite()` / `checkIsFavorite()`.

### Redux slice (`favoritesSlice.ts`)
- State: `{ favoriteIds: number[], isLoading: boolean, error: string | null }`.
- Actions: `fetchFavorites`, `toggleFavoriteAsync`, `optimisticToggle`, `clearFavorites`.
- Optimistic reducer adds/removes the ID before API call.

### UI usage
- Favorite button calls optimistic toggle then async toggle; on catch, re-toggle to revert.
- Favorites page renders transformed list and supports remove button (uses same toggle).

## Future improvements (optional)
- Pagination for large lists.
- Caching layer for favorites.
- Bulk add/remove.
- Better error toasts and retry.
