<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TransferController extends Controller
{
    public function history()
{
    $userId = auth()->id();

    $transfers = \App\Models\Transfer::with([
        'originAccount.bank',
        'originAccount.owner',
        'destinationAccount.bank',
        'destinationAccount.owner'
    ])
    ->where('user_id', $userId)
    ->orderBy('created_at', 'desc')
    ->get();
// Revisar en log de Laravel
    \Log::info($transfers);
    return Inertia::render('Transfers/History', [
        'transfers' => $transfers
    ]);
}
}
