<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Business Logo Upload / Remove — Admin-only endpoint.
 * Mirrors ProfileAvatarController exact security and R2 storage pattern.
 */
class SettingLogoController extends Controller
{
    /**
     * Upload or replace the business logo.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:5120',
            ],
        ]);

        $existing = Setting::where('key', 'business_logo')->first();

        // Delete old logo file if present
        if ($existing && $existing->value) {
            try {
                $oldPath = $this->urlToStoragePath($existing->value);
                if ($oldPath && Storage::disk('s3')->exists($oldPath)) {
                    Storage::disk('s3')->delete($oldPath);
                }
            } catch (\Throwable $e) {
                Log::warning('SettingLogo: could not delete old logo.', [
                    'old_url' => $existing->value,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        $file = $request->file('logo');
        $ext = $file->extension();
        $filename = 'logo_' . Str::random(20) . '.' . $ext;
        $path = $file->storeAs('logos', $filename, 's3');
        $url = Storage::disk('s3')->url($path);

        Setting::updateOrCreate(
            ['key' => 'business_logo'],
            ['value' => $url]
        );

        return response()->json([
            'message'  => 'Business logo uploaded successfully.',
            'logo_url' => $url,
        ]);
    }

    /**
     * Remove the business logo.
     */
    public function remove(Request $request): JsonResponse
    {
        $setting = Setting::where('key', 'business_logo')->first();

        if ($setting && $setting->value) {
            try {
                $oldPath = $this->urlToStoragePath($setting->value);
                if ($oldPath && Storage::disk('s3')->exists($oldPath)) {
                    Storage::disk('s3')->delete($oldPath);
                }
            } catch (\Throwable $e) {
                Log::warning('SettingLogo: could not delete logo on remove.', [
                    'error' => $e->getMessage(),
                ]);
            }

            $setting->update(['value' => null]);
        }

        return response()->json([
            'message'  => 'Business logo removed.',
            'logo_url' => null,
        ]);
    }

    /**
     * Convert stored URL back to relative storage path.
     */
    private function urlToStoragePath(?string $url): ?string
    {
        if (!$url) return null;

        if (str_starts_with($url, '/storage/')) {
            return substr($url, 9);
        }

        $localBase = rtrim(config('app.url'), '/') . '/storage/';
        if (str_starts_with($url, $localBase)) {
            return substr($url, strlen($localBase));
        }

        $s3Base = rtrim(config('filesystems.disks.s3.url'), '/') . '/';
        if ($s3Base && str_starts_with($url, $s3Base)) {
            return substr($url, strlen($s3Base));
        }

        return null;
    }
}
