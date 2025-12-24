# Avatar Upload Flow

End-to-end flow for uploading and applying a user avatar.

## Scope and files

- Backend: `movie-backend/src/controllers/upload.controller.ts` (`POST /upload/avatar`), `src/services/s3.service.ts` (`uploadAvatar`), `src/controllers/auth.controller.ts` (`PUT /auth/profile`), `src/services/auth.service.ts`.
- Frontend: `movie-frontend/movie-app/src/app/account/page.tsx` (UI handling), Axios instance (`src/lib/axios-instance.ts`).

## Flow (frontend → backend)

1) User clicks avatar on `/account`, selects image file (<5MB).
2) Frontend sends multipart `POST /api/upload/avatar` with field `avatar` (JWT required).
3) Backend validates mimetype/size, uploads to S3, returns `{ url, key }`.
4) Frontend calls `PUT /api/auth/profile` with `{ image: url }`.
5) Backend saves `image` for the user and returns updated profile.
6) Frontend updates stored user (auth storage/state), updates UI and caches URL.

## Validation and limits

- File size limit: 5MB.
- Allowed: `image/*` mimetypes.
- Sanitized filenames; stored under `avatars/` in S3.

## Error handling

- If upload fails: show error, do not call profile update.
- If profile update fails: keep previous avatar, show error.
- Fallback avatar: `/images/no-avatar.svg` and onError handlers in components.

## Notes

- `next.config.ts` whitelists S3 domain for Next Image; for other buckets/regions, update `images.domains`.
- On logout, ensure any cached avatar URL in client state is cleared with the user profile.
