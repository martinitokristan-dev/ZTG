<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LogDamagedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'qty'    => 'required|integer|min:1',
            'reason' => 'required|string|max:255',
        ];
    }
}
