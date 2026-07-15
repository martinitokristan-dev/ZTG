<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RefundReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Which items are being refunded/returned
            'items'             => 'required|array|min:1',
            'items.*.item_id'   => 'required|exists:transaction_items,id',
            'items.*.qty'       => 'required|integer|min:1',

            // Reason (predefined list)
            'reason'            => 'required|string|max:255',

            // Approver verification
            'approver_id'       => 'required|exists:users,id',
            'approval_pin'      => 'required|string',

            // Stock handling flags
            'restore_stock'     => 'required|boolean',
            'mark_damaged'      => 'required|boolean',
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->has('items') && is_array($this->input('items'))) {
            $mappedItems = array_map(function ($item) {
                if (isset($item['id']) && !isset($item['item_id'])) {
                    $item['item_id'] = $item['id'];
                }
                return $item;
            }, $this->input('items'));
            $this->merge(['items' => $mappedItems]);
        }

        if ($this->has('approval_code') && !$this->has('approval_pin')) {
            $this->merge(['approval_pin' => $this->input('approval_code')]);
        }

        if (!$this->has('approver_id')) {
            $user = \App\Models\User::where('role', \App\Enums\UserRole::ADMIN->value)->first()
                 ?: \App\Models\User::where('role', \App\Enums\UserRole::SUPERVISOR->value)->first();
            if ($user) {
                $this->merge(['approver_id' => $user->id]);
            }
        }
    }
}
