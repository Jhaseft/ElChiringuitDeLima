<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    use HasFactory;

    protected $fillable = [
    'user_id',
    'origin_account_number',
    'destination_account_number',
    'amount',
    'exchange_rate',
    'status',
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function originAccount()
{
    return $this->hasOne(Account::class, 'account_number', 'origin_account_number');
}

public function destinationAccount()
{
    return $this->hasOne(Account::class, 'account_number', 'destination_account_number');
}


}
