<?php

namespace App\Services\Settings;

use App\Models\VariantOption;
use App\Models\VariantType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class VariantService
{
    /**
     * Get all variant types with their options.
     */
    public function getAllTypes(): Collection
    {
        return VariantType::with('options')->get();
    }

    /**
     * Create a new variant type and optionally pre-seed its options.
     */
    public function createType(array $data): VariantType
    {
        return DB::transaction(function () use ($data) {
            $type = VariantType::create([
                'name' => $data['name'],
            ]);

            if (!empty($data['options']) && is_array($data['options'])) {
                foreach ($data['options'] as $optionValue) {
                    $type->options()->create([
                        'value' => $optionValue,
                    ]);
                }
            }

            return $type->load('options');
        });
    }

    /**
     * Update an existing variant type name.
     */
    public function updateType(VariantType $type, array $data): VariantType
    {
        $type->update($data);
        return $type;
    }

    /**
     * Delete a variant type. Related options will cascade delete.
     */
    public function deleteType(VariantType $type): void
    {
        $type->delete();
    }

    /**
     * Add a variant option to a variant type.
     */
    public function addOption(VariantType $type, array $data): VariantOption
    {
        return $type->options()->create([
            'value' => $data['value'],
        ]);
    }

    /**
     * Update an existing variant option.
     */
    public function updateOption(VariantOption $option, array $data): VariantOption
    {
        $option->update(['value' => $data['value']]);
        return $option;
    }

    /**
     * Delete a specific variant option.
     */
    public function deleteOption(VariantOption $option): void
    {
        $option->delete();
    }
}
