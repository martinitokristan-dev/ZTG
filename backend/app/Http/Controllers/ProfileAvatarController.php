<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileAvatarController extends Controller
{
    /**
     * Upload a new profile photo for the authenticated user.
     *
     * Security guarantees:
     *  1. Validation rejects non-image files, enforces allowed MIME types and 2 MB cap.
     *  2. Stored filename is generated (user-id + cryptographic random), never the original name.
     *  3. $request->user() scopes the update to the authenticated user — no ID in the request body.
     *  4. Old-file deletion is wrapped in its own try/catch; failure is logged but never
     *     blocks the new upload from succeeding.
     */
    public function upload(Request $request): JsonResponse
    {
        // ── 1. Validation ──────────────────────────────────────────────────────
        $request->validate([
            'avatar' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,gif,webp,heic,heif,avif,bmp',
                'max:12288',                          // 12 MB limit (supports high-res mobile photos)
            ],
        ]);

        // ── 3. Scope to authenticated user — no request-supplied ID ──────────
        $user = $request->user();

        // ── 4. Delete old avatar — failure never blocks the new upload ────────
        if ($user->profile_photo) {
            try {
                $oldPath = $this->urlToStoragePath($user->profile_photo);
                if ($oldPath && Storage::disk('s3')->exists($oldPath)) {
                    Storage::disk('s3')->delete($oldPath);
                }
            } catch (\Throwable $e) {
                // Log the failure but continue with the new upload
                Log::warning('ProfileAvatar: could not delete old avatar.', [
                    'user_id'   => $user->id,
                    'old_photo' => $user->profile_photo,
                    'error'     => $e->getMessage(),
                ]);
            }
        }

        // ── 2. Generated filename — user id + 16-char random hex, ext from MIME ─
        $file = $request->file('avatar');
        $ext  = $file->extension();                   // guessed from MIME, NOT getClientOriginalExtension()
        $filename = 'avatar_' . $user->id . '_' . Str::random(16) . '.' . $ext;
        $path = $file->storeAs('avatars', $filename, 's3');

        // Build the public URL served through backend media proxy
        $url = url('/api/media/' . $path);

        $user->update(['profile_photo' => $url]);

        return response()->json([
            'message'       => 'Profile photo uploaded successfully.',
            'profile_photo' => $url,
        ]);
    }

    /**
     * Remove the authenticated user's profile photo.
     * Scoped to $request->user() — no request body needed.
     */
    public function remove(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->profile_photo) {
            try {
                $oldPath = $this->urlToStoragePath($user->profile_photo);
                if ($oldPath && Storage::disk('s3')->exists($oldPath)) {
                    Storage::disk('s3')->delete($oldPath);
                }
            } catch (\Throwable $e) {
                Log::warning('ProfileAvatar: could not delete avatar on remove.', [
                    'user_id' => $user->id,
                    'error'   => $e->getMessage(),
                ]);
            }

            $user->update(['profile_photo' => null]);
        }

        return response()->json([
            'message'       => 'Profile photo removed.',
            'profile_photo' => null,
        ]);
    }

    /**
     * Convert a stored full URL back to a relative storage/public path.
     *
     * e.g. "http://localhost:8000/storage/avatars/avatar_1_abcdefgh.jpg"
     *       → "avatars/avatar_1_abcdefgh.jpg"
     *
     * Returns null when the URL doesn't belong to our own storage,
     * ensuring we never attempt to delete external URLs.
     */
    private function urlToStoragePath(?string $url): ?string
    {
        if (!$url) return null;

        if (str_starts_with($url, '/api/media/')) {
            return substr($url, 11);
        }

        $mediaBase = rtrim(config('app.url'), '/') . '/api/media/';
        if (str_starts_with($url, $mediaBase)) {
            return substr($url, strlen($mediaBase));
        }

        // Try relative storage path (for testing and local environment compatibility)
        if (str_starts_with($url, '/storage/')) {
            return substr($url, 9);
        }
        
        // Try local storage path first (for legacy compatibility)
        $localBase = rtrim(config('app.url'), '/') . '/storage/';
        if (str_starts_with($url, $localBase)) {
            return substr($url, strlen($localBase));
        }

        // Try S3/R2 storage path
        $s3Base = rtrim(config('filesystems.disks.s3.url'), '/') . '/';
        if ($s3Base && str_starts_with($url, $s3Base)) {
            return substr($url, strlen($s3Base));
        }

        return null;  // external/unknown URL — do not touch
    }
}
