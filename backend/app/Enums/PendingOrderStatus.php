<?php

namespace App\Enums;

enum PendingOrderStatus: string
{
    case PENDING = 'Pending';
    case URGENT = 'Urgent';
    case APPROVED = 'Approved';
    case REJECTED = 'Rejected';
}
