<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => [
                'required',
                'string',
                'max:20',
                'unique:users,employee_id',
                'regex:/^EMP-\d+$/'
            ],
            'name' => 'required|string|max:100',
            'real_name' => 'required|string|max:100',
            'email' => 'nullable|email|unique:users,email|max:255',
            'username' => 'required|string|unique:users,username|max:50',
            'password' => 'required|string|min:6',
            'pin' => 'nullable|string|digits:4',
            'role' => 'required|string|in:Admin,Cashier,Supervisor',
            'status' => 'nullable|string|in:Active,Inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.regex' => 'The employee ID must be in the format EMP-XXXX (e.g., EMP-001).',
        ];
    }
}
