<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TcPunto extends Model
{
    protected $table = 'tc_puntos';

    protected $fillable = ['user_id', 'balance'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transacciones()
    {
        return $this->hasMany(TcPuntoTransaccion::class, 'user_id', 'user_id');
    }
}
