<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{ 
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payment_method_id',
        'origin_account_id',
        'destination_account_id',
        'amount',
        'exchange_rate',
        'converted_amount',
        'modo',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function originAccount()
    {
        return $this->belongsTo(Account::class, 'origin_account_id')->with('bank','owner');
    }

    public function destinationAccount()
    {
        return $this->belongsTo(Account::class, 'destination_account_id')->with('bank','owner');
    }

    // ─── Nuevas relaciones de comprobantes ────────────────

    public function receipts()
    {
        return $this->hasMany(TransactionReceipt::class, 'transaction_id');
    }

    public function clientReceipts()
    {
        return $this->hasMany(TransactionReceipt::class, 'transaction_id')
                    ->where('receipt_type', 'client');
    }

    public function adminReceipts()
    {
        return $this->hasMany(TransactionReceipt::class, 'transaction_id')
                    ->where('receipt_type', 'admin');
    }
}