<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TcCanje extends Model
{
    protected $table = 'tc_canjes';

    protected $fillable = ['user_id', 'producto_id', 'puntos_usados', 'status', 'notas'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function producto()
    {
        return $this->belongsTo(TcProducto::class, 'producto_id');
    }
}
