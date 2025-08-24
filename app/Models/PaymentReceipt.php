<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'transfer_id',
        'file_path',
    ];

    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }
}
