<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $myId = $this->user()->id;

        return [
            'name' => 'required|string|max:100',
            'real_name' => 'required|string|max:100',
            'email' => 'nullable|email|max:255|unique:users,email,' . $myId,
            'username' => 'required|string|max:50|unique:users,username,' . $myId,
        ];
    }
}
