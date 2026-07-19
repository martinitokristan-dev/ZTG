<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checker extends Model
{
    protected $fillable = ['name', 'status'];
    
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
