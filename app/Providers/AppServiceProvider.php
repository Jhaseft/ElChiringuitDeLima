<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Forzar URLs con HTTPS en producción
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Tu configuración de Vite (prefetch)
        Vite::prefetch(concurrency: 3);
    }
}
