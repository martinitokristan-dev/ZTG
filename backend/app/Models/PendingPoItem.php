<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PendingPoItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'pending_po_id',
        'product_id',
        'qty',
        'price',
    ];

    public function pendingPurchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PendingPurchaseOrder::class, 'pending_po_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
