<?php

namespace App\Enums;

enum TransactionType: string
{
    case SALE = 'sale';
    case RESERVATION = 'reservation';
    case INVENTORY = 'inventory';
    case SYSTEM = 'system';
}
