<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TcPuntoTransaccion extends Model
{
    protected $table = 'tc_puntos_transacciones';

    protected $fillable = ['user_id', 'transfer_id', 'puntos', 'tipo', 'descripcion'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }
}
