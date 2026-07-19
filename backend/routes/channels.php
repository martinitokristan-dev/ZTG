<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channel Authorization
|--------------------------------------------------------------------------
|
| Concern-based private channels to ensure strict role-level security.
| Authorized users will subscribe to specific channels matching their concern.
|
*/

// Inventory Channel: accessible to all store staff
Broadcast::channel('inventory', function ($user) {
    $role = $user->role->value ?? $user->role;
    return in_array($role, ['Admin', 'Supervisor', 'Cashier', 'Checker']);
});

// Products Channel (for price/metadata updates): accessible to Admin, Supervisor, Cashier
Broadcast::channel('products', function ($user) {
    $role = $user->role->value ?? $user->role;
    return in_array($role, ['Admin', 'Supervisor', 'Cashier']);
});

// Transactions Channel (sales, refunds, daily ledger updates): accessible to Admin, Supervisor, Cashier
Broadcast::channel('transactions', function ($user) {
    $role = $user->role->value ?? $user->role;
    return in_array($role, ['Admin', 'Supervisor', 'Cashier']);
});

// Reservations Channel (holds, order status): accessible to Admin, Supervisor, Cashier
Broadcast::channel('reservations', function ($user) {
    $role = $user->role->value ?? $user->role;
    return in_array($role, ['Admin', 'Supervisor', 'Cashier']);
});

// Notifications Channel (low stock alerts, system alerts): restricted to Admin and Supervisor
Broadcast::channel('notifications', function ($user) {
    $role = $user->role->value ?? $user->role;
    return in_array($role, ['Admin', 'Supervisor']);
});
