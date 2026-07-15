<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'reference_id',
        'type',
        'details',
        'date_archived',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
            'date_archived' => 'date',
        ];
    }
}
