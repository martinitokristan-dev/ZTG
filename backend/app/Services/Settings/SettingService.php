<?php

namespace App\Services\Settings;

use App\Models\Setting;

class SettingService
{
    /**
     * Get all settings as a key-value associative array.
     */
    public function getAll(): array
    {
        return Setting::pluck('value', 'key')->toArray();
    }

    /**
     * Bulk update settings.
     */
    public function updateSettings(array $settings): void
    {
        foreach ($settings as $key => $value) {
            // Protect business_logo from being accidentally erased by bulk settings PUT
            if ($key === 'business_logo' && (is_null($value) || $value === '')) {
                continue;
            }
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
