<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransferMethod extends Model
{
    protected $fillable = [
        'currency_pair',
        'type',
        'title',
        'number',
        'image',
    ];
}