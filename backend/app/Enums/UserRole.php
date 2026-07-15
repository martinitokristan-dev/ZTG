<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'Admin';
    case CASHIER = 'Cashier';
    case SUPERVISOR = 'Supervisor';
}
