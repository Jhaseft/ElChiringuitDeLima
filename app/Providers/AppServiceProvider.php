<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use App\Models\TipoCambio;
use App\Models\Bank;
use App\Models\TransferMethod;
use App\Models\Banner;
use App\Models\TcCategoria;
use App\Models\TcProducto;
use App\Observers\TipoCambioObserver;
use App\Observers\BankObserver;
use App\Observers\TransferMethodObserver;
use App\Observers\BannerObserver;
use App\Observers\TcCategoriaObserver;
use App\Observers\TcProductoObserver;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Forzar URLs con HTTPS en producción
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Tu configuración de Vite (prefetch)
        Vite::prefetch(concurrency: 3);

        // Invalidación de caché (Redis): al editar estos modelos se borra su
        // llave para que el siguiente request traiga el dato fresco (Bloque A).
        TipoCambio::observe(TipoCambioObserver::class);
        Bank::observe(BankObserver::class);
        TransferMethod::observe(TransferMethodObserver::class);
        Banner::observe(BannerObserver::class);
        TcCategoria::observe(TcCategoriaObserver::class);
        TcProducto::observe(TcProductoObserver::class);
    }
}
