<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountOwner extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'document_number',
        'phone',
    ];

    public function accounts()
    {
        return $this->hasMany(Account::class, 'owner_id');
    }
}
