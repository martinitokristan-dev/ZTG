<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVariantTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|unique:variant_types,name|max:100',
            'options' => 'nullable|array',
            'options.*' => 'required|string|max:100',
        ];
    }
}
