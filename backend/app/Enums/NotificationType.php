<?php

namespace App\Enums;

enum NotificationType: string
{
    case LOW_STOCK = 'low_stock';
    case TRANSACTION = 'transaction';
    case RESERVATION = 'reservation';
    case SYSTEM = 'system';
}
