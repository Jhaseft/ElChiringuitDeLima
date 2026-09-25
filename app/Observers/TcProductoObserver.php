<?php

namespace App\Observers;

use App\Models\TcProducto;
use Illuminate\Support\Facades\Cache;

// Invalida el catálogo de TC Puntos cuando cambia un producto (precio, stock, etc.).
class TcProductoObserver
{
    public function saved(TcProducto $producto): void
    {
        Cache::forget('tcpuntos_catalogo');
    }

    public function deleted(TcProducto $producto): void
    {
        Cache::forget('tcpuntos_catalogo');
    }
}
