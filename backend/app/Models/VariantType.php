<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VariantType extends Model
{
    use HasFactory;

    // Disabling default timestamps since migration has created_at only
    public $timestamps = false;

    protected $fillable = [
        'name',
    ];

    public function options(): HasMany
    {
        return $this->hasMany(VariantOption::class);
    }
}
