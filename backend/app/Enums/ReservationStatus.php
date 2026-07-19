<?php

namespace App\Enums;

enum ReservationStatus: string
{
    case PENDING = 'Pending';
    case COMPLETED = 'Completed';
    case CANCELLED = 'Cancelled';
    case EXPIRED = 'Expired';
}
