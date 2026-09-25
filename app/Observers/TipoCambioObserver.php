<?php

namespace App\Observers;

use App\Models\TipoCambio;
use Illuminate\Support\Facades\Cache;

// Invalida el caché del historial de tipo de cambio en cuanto cambia (scheduler
// o panel). Asi el siguiente request trae el valor nuevo sin esperar el TTL.
class TipoCambioObserver
{
    public function saved(TipoCambio $tipoCambio): void
    {
        Cache::forget('tc_historial');
    }

    public function deleted(TipoCambio $tipoCambio): void
    {
        Cache::forget('tc_historial');
    }
}
