<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TcProducto extends Model
{
    protected $table = 'tc_productos';

    protected $fillable = [
        'categoria_id', 'nombre', 'descripcion',
        'imagen_url', 'costo_puntos', 'stock', 'activo', 'orden',
    ];

    public function categoria()
    {
        return $this->belongsTo(TcCategoria::class, 'categoria_id');
    }

    public function canjes()
    {
        return $this->hasMany(TcCanje::class, 'producto_id');
    }
}
