<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuracion';
    protected $fillable = ['clave', 'valor', 'tipo', 'etiqueta', 'descripcion', 'grupo'];

    public static function get(string $clave, mixed $default = null): mixed
    {
        $row = static::where('clave', $clave)->first();

        if (!$row) {
            return $default;
        }

        return match ($row->tipo) {
            'decimal'  => (float) $row->valor,
            'entero'   => (int)   $row->valor,
            'booleano' => filter_var($row->valor, FILTER_VALIDATE_BOOLEAN),
            default    => $row->valor,
        };
    }

    public static function set(string $clave, mixed $valor): void
    {
        static::where('clave', $clave)->update(['valor' => $valor]);
    }
}
