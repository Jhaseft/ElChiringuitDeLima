<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'origin_account_id',
        'destination_account_id',
        'amount',
        'exchange_rate',
        'converted_amount',   // monto convertido
        'modo',               // <--- agregar aquí
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function originAccount()
    {
        return $this->belongsTo(Account::class, 'origin_account_id')->with('bank','owner');
    }

    public function destinationAccount()
    {
        return $this->belongsTo(Account::class, 'destination_account_id')->with('bank','owner');
    }
}
