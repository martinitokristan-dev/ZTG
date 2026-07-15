<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product') instanceof \App\Models\Product
            ? $this->route('product')->id
            : $this->route('product');

        return [
            'name'        => 'required|string|max:255',
            'chinese_name'=> 'nullable|string|max:255',
            'part_no'     => 'required|string|max:50|unique:products,part_no,' . $productId,
            'category_id' => 'required|exists:categories,id',
            'address'     => 'nullable|string|max:50',
            'stock'       => 'required|integer|min:0',
            'alert_limit' => 'nullable|integer|min:0',
            'price1'      => 'required|numeric|min:0',
            'price2'      => 'required|numeric|min:0',
            'status'      => 'required|string|in:Active,Low Stock,No Stock,Disabled',
            'notes'       => 'nullable|string',
            'image'       => 'nullable|string|max:255',
            'is_dead_stock'=> 'nullable|boolean',
            'damaged'     => 'nullable|integer|min:0',
        ];
    }
}
