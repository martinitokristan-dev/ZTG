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
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
