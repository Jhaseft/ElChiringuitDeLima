<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

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
    ];

    // OJO: 'kyc_status' y 'kyc_session_id' se asignan explícitamente
    // (->kyc_status = ...; ->save()) y NO son mass-assignable a propósito,
    // para que ningún update($request->all()) permita auto-verificarse.

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
    ];

    /**
     * Atributos calculados que se agregan a la serialización.
     * has_password: la app lo usa para saber si debe pedir contraseña
     * al completar el perfil (usuarios Google/Apple no tienen).
     */
    protected $appends = ['has_password'];

    public function getHasPasswordAttribute(): bool
    {
        return !is_null($this->password);
    }

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
