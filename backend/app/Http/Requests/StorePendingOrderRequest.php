<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePendingOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cart'                => 'required|array|min:1',
            'cart.*.product_id'   => 'required|exists:products,id',
            'cart.*.qty'          => 'required|integer|min:1',
            'cart.*.price'        => 'required|numeric|min:0',
            'customer_name'       => 'required|string|max:100',
            'customer_phone'      => 'nullable|string|max:20',
            'doc_type'            => 'required|string|in:S.I.,D.R.,C.I.',
        ];
    }
}
