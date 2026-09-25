<?php

namespace App\Observers;

use App\Models\TransferMethod;
use Illuminate\Support\Facades\Cache;

// Invalida el caché de métodos de transferencia cuando el admin los edita.
class TransferMethodObserver
{
    public function saved(TransferMethod $method): void
    {
        Cache::forget('transfer_methods');
    }

    public function deleted(TransferMethod $method): void
    {
        Cache::forget('transfer_methods');
    }
}
