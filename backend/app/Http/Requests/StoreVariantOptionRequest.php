<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVariantOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $variantTypeId = $this->route('variant_type') 
            ? ($this->route('variant_type')->id ?? $this->route('variant_type'))
            : ($this->route('variant') ? ($this->route('variant')->id ?? $this->route('variant')) : $this->route('id'));

        return [
            'value' => [
                'required',
                'string',
                'max:100',
                Rule::unique('variant_options')->where(function ($query) use ($variantTypeId) {
                    return $query->where('variant_type_id', $variantTypeId);
                })
            ]
        ];
    }
}
