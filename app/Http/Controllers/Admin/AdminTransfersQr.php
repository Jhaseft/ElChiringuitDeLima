<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transfer;
use Inertia\Inertia;

class AdminTransfersQr extends Controller
{
    // Listar todas las transferencias con QR
    public function index(Request $request)
    {
        $perPage = (int) $request->query('perPage', 10);
        $search  = trim($request->query('search', ''));

        $query = Transfer::with([
            'user',
            'paymentMethod',
            'destinationAccount.bank',
            'destinationAccount.owner',
            'clientReceipts',
            'adminReceipts',
        ])
        ->whereHas('paymentMethod', fn($q) => $q->where('slug', 'qr'))
        ->orderBy('created_at', 'desc');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'LIKE', "%$search%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('first_name', 'LIKE', "%$search%")
                          ->orWhere('last_name', 'LIKE', "%$search%");
                    });
            });
        }

        $transfers = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Qr', [
            'transfers' => $transfers,
            'filters'   => ['search' => $search, 'perPage' => $perPage],
        ]);
    }
}
