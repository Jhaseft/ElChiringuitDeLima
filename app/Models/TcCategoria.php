<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TcCategoria extends Model
{
    protected $table = 'tc_categorias';

    protected $fillable = ['nombre', 'descripcion', 'imagen_url', 'activo', 'orden'];

    public function productos()
    {
        return $this->hasMany(TcProducto::class, 'categoria_id')->orderBy('orden');
    }
}
