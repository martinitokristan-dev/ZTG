<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VoidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'void_reason'   => 'required|string|max:255',
            'admin_id'      => 'required|exists:users,id',
            'admin_pin'     => 'required|string',
            'restore_stock' => 'required|boolean',
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->has('reason') && !$this->has('void_reason')) {
            $this->merge(['void_reason' => $this->input('reason')]);
        }

        if (!$this->has('admin_id')) {
            $user = \App\Models\User::where('username', 'admin')->first()
                 ?: \App\Models\User::where('role', \App\Enums\UserRole::ADMIN->value)->first();
            if ($user) {
                $this->merge(['admin_id' => $user->id]);
            }
        }
    }
}
