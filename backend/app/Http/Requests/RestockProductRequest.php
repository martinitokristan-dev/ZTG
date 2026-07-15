<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RestockProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restocks'               => 'required|array|min:1',
            'restocks.*.product_id'  => 'required|exists:products,id',
            'restocks.*.qty'         => 'required|integer|min:1',
        ];
    }
}
