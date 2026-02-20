<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Los atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'nationality',
        'document_number',
        'password',
        'provider',
        'provider_id',
        'accepted_terms_at',
        'terms_version',
        'kyc_sesion_id',
        'kyc_status',
    ];

    /**
     * Los atributos que deben ocultarse en arrays.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Los atributos que deben castearse.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'accepted_terms_at' => 'datetime',
    ];

    public function accounts()
{
    return $this->hasMany(Account::class);
}

public function transfers()
{
    return $this->hasMany(Transfer::class);
}
public function media()
{
    return $this->hasMany(UserMedia::class);
}
}
