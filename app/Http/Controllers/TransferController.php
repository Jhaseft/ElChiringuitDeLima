<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transfer;

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

    return Inertia::render('Transfers/History', [
        'transfers' => $transfers
    ]);
}

public function historymobile(Request $request)
{
    $userId = $request->query('user_id') ?? $request->user()?->id;

    if (!$userId) {
        \Log::warning('❌ No se encontró el usuario en historymobile');
        return response()->json(['error' => 'Usuario no encontrado'], 404);
    }

    $transfers = Transfer::with([
        'originAccount.bank',
        'originAccount.owner',
        'destinationAccount.bank',
        'destinationAccount.owner'
    ])
    ->where('user_id', $userId)
    ->latest()
    ->get()
    ->map(function ($t) {
        return [
            'id' => $t->id,
            'monto' => $t->amount,
            'converted_amount' => $t->converted_amount,
            'modo' => $t->modo,
            'fecha' => $t->created_at->format('Y-m-d H:i:s'),
            'estado' => $t->status,
            'origen' => [
                'id' => $t->originAccount->id,
                'numero' => $t->originAccount->account_number,
                'banco' => $t->originAccount->bank->name,
                'owner' => $t->originAccount->owner ? [
                    'full_name' => $t->originAccount->owner->full_name,
                    'document_number' => $t->originAccount->owner->document_number,
                    'phone' => $t->originAccount->owner->phone,
                ] : null,
            ],
            'destino' => [
                'id' => $t->destinationAccount->id,
                'numero' => $t->destinationAccount->account_number,
                'banco' => $t->destinationAccount->bank->name,
                'owner' => $t->destinationAccount->owner ? [
                    'full_name' => $t->destinationAccount->owner->full_name,
                    'document_number' => $t->destinationAccount->owner->document_number,
                    'phone' => $t->destinationAccount->owner->phone,
                ] : null,
            ],
        ];
    });

    \Log::info("📤 historymobile user_id={$userId}", $transfers->toArray());

    return response()->json($transfers);
}
}
