<?php

namespace App\Observers;

use App\Models\Bank;
use Illuminate\Support\Facades\Cache;

// Invalida el caché de bancos cuando el admin edita uno.
class BankObserver
{
    public function saved(Bank $bank): void
    {
        Cache::forget('bancos_all');
    }

    public function deleted(Bank $bank): void
    {
        Cache::forget('bancos_all');
    }
}
