<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionReceipt extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'transaction_id',
        'receipt_url',
        'receipt_type',
        'uploaded_by',
    ];

    protected $casts = [
        'receipt_type' => 'string',
        'created_at'   => 'datetime',
    ];

    // ─── Relaciones ───────────────────────────────────────

    public function transfer()
    {
        return $this->belongsTo(Transfer::class, 'transaction_id');
    }
}