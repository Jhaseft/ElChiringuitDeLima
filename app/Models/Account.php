<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'method_type',
        'user_id',
        'bank_id',
        'account_number',
        'qr_value',
        'qr_country',
        'account_type',
        'owner_id',
        'desactivate',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public function owner()
    {
        return $this->belongsTo(AccountOwner::class, 'owner_id');
    }

    public function transfersOrigen()
    {
        return $this->hasMany(Transfer::class, 'origin_account_id');
    }

    public function transfersDestino()
    {
        return $this->hasMany(Transfer::class, 'destination_account_id');
    }
}
