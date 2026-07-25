<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaController extends Controller
{
    /**
     * Serve public uploaded assets (avatars, logos, products) cleanly via backend proxy.
     * Prevents mobile carrier ISP DNS blocking of external r2.dev subdomains.
     */
    public function show(string $path)
    {
        // Sanitize path against directory traversal
        $cleanPath = ltrim(str_replace('..', '', $path), '/');

        // Check if file exists on s3 / R2 disk
        if (Storage::disk('s3')->exists($cleanPath)) {
            return Storage::disk('s3')->response($cleanPath, null, [
                'Cache-Control' => 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin' => '*',
            ]);
        }

        // Check local storage fallback
        if (Storage::disk('public')->exists($cleanPath)) {
            return Storage::disk('public')->response($cleanPath, null, [
                'Cache-Control' => 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin' => '*',
            ]);
        }

        return response()->json(['message' => 'Media asset not found.'], 404);
    }
}
