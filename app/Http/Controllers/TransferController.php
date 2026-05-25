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
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $perPage = (int) $request->query('per_page', 15);
        $search  = $request->query('search', '');

        $query = Transfer::with([
            'paymentMethod',
            'originAccount.bank',
            'originAccount.owner',
            'destinationAccount.bank',
            'destinationAccount.owner',
            'receipts'
        ])
            ->where('user_id', $userId)
            ->latest();

        if ($search !== '') {
            $query->where('id', $search);
        }

        $paginated = $query->paginate($perPage);

        $mapAccount = function ($acc) {
            if (!$acc) return null;
            return [
                'id'     => $acc->id,
                'numero' => $acc->account_number,
                'banco'  => $acc->bank?->name,
                'owner'  => $acc->owner ? [
                    'full_name'       => $acc->owner->full_name,
                    'document_number' => $acc->owner->document_number,
                    'phone'           => $acc->owner->phone,
                ] : null,
            ];
        };

        $data = $paginated->getCollection()->map(function ($t) use ($mapAccount) {
            $slug = $t->paymentMethod?->slug ?? 'bank_transfer';

            return [
                'id'               => $t->id,
                'monto'            => $t->amount,
                'converted_amount' => $t->converted_amount,
                'modo'             => $t->modo,
                'fecha'            => $t->created_at->format('Y-m-d H:i:s'),
                'estado'           => $t->status,
                'payment_method'   => [
                    'slug' => $slug,
                    'name' => $t->paymentMethod?->name ?? ucfirst($slug),
                ],
                'origen'  => $mapAccount($t->originAccount),
                'destino' => $mapAccount($t->destinationAccount),
                'receipts' => $t->receipts->map(fn($r) => [
                    'id'           => $r->id,
                    'receipt_url'  => $r->receipt_url,
                    'receipt_type' => $r->receipt_type,
                ])->values(),
            ];
        });

        return response()->json([
            'data'         => $data,
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'total'        => $paginated->total(),
        ]);
    }
}
