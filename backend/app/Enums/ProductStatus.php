<?php

namespace App\Enums;

enum ProductStatus: string
{
    case ACTIVE = 'Active';
    case LOW_STOCK = 'Low Stock';
    case NO_STOCK = 'No Stock';
    case DISABLED = 'Disabled';
}
