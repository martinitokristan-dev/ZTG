<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVariantOptionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $optionId = $this->route('variant_option') ? ($this->route('variant_option')->id ?? $this->route('variant_option')) : null;
        $variantOption = \App\Models\VariantOption::find($optionId);
        $variantTypeId = $variantOption ? $variantOption->variant_type_id : null;

        return [
            'value' => [
                'required',
                'string',
                'max:100',
                \Illuminate\Validation\Rule::unique('variant_options')->where(function ($query) use ($variantTypeId) {
                    return $query->where('variant_type_id', $variantTypeId);
                })->ignore($optionId)
            ]
        ];
    }
}
