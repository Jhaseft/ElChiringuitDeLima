<?php

namespace App\Observers;

use App\Models\TcCategoria;
use Illuminate\Support\Facades\Cache;

// Invalida el catálogo de TC Puntos cuando cambia una categoría.
class TcCategoriaObserver
{
    public function saved(TcCategoria $categoria): void
    {
        Cache::forget('tcpuntos_catalogo');
    }

    public function deleted(TcCategoria $categoria): void
    {
        Cache::forget('tcpuntos_catalogo');
    }
}
