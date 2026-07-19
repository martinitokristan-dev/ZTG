<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'business_name' => 'ZTG Heavy Parts',
            'tax_rate' => '12',
            'low_stock_threshold' => '5',
            'currency' => 'PHP',
            'price1_label' => 'Original Price',
            'price2_label' => 'Retail Price',
            'auto_deduct_stock' => 'true',
            'reservation_grace_period' => '3',
            'reservation_deposit_policy' => 'forfeit',
            'dead_stock_period' => '30',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
