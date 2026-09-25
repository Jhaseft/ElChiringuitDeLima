<?php

namespace App\Observers;

use App\Models\Banner;
use Illuminate\Support\Facades\Cache;

// Invalida el caché de banners del home cuando el admin los edita.
class BannerObserver
{
    public function saved(Banner $banner): void
    {
        Cache::forget('banners_activos');
    }

    public function deleted(Banner $banner): void
    {
        Cache::forget('banners_activos');
    }
}
