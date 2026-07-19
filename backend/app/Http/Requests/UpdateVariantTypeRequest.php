<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVariantTypeRequest extends FormRequest
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
            'name' => 'required|string|max:100|unique:variant_types,name,' . $variantTypeId,
        ];
    }
}
