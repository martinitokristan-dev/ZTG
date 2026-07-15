<?php

namespace App\Models;

use App\Enums\DocType;
use App\Enums\PendingOrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PendingPurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'po_no',
        'date',
        'customer_id',
        'items_count',
        'total',
        'doc_type',
        'cashier_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'doc_type' => DocType::class,
            'status' => PendingOrderStatus::class,
            'date' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PendingPoItem::class, 'pending_po_id');
    }
}
