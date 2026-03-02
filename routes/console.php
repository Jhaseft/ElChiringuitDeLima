<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Actualiza el tipo de cambio cada 30 minutos.
// Solo guarda en BD si los valores cambiaron respecto al último registro.
Schedule::command('tipo-cambio:actualizar')->everyFiveMinutes();
