<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller; 
use Illuminate\Http\Request;
use App\Models\Transfer;
use Inertia\Inertia;


class AdminTransfersEfectivo extends Controller
{
   
     // Listar todas las transferencias de forma amigable
    public function index(Request $request)
    {
        $perPage = (int) $request->query('perPage', 10);
        $search  = trim($request->query('search', ''));

        $query = Transfer::with([
            'user',
            'paymentMethod',
            'originAccount.bank',
            'destinationAccount.bank',
        ])
        ->whereHas('paymentMethod', fn($q) => $q->where('slug', 'cash'))
        ->orderBy('created_at', 'desc');

         if ($search !== '') {
        $query->where(function ($q) use ($search) {

            // Buscar por ID de la transferencia
            $q->where('id', 'LIKE', "%$search%")

            // O por nombre del usuario
            ->orWhereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'LIKE', "%$search%")
                ->orWhere('last_name', 'LIKE', "%$search%");
            });

          });
        }

        $transfers = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Efectivo', [
            'transfers' => $transfers,
            'filters'   => ['search' => $search, 'perPage' => $perPage],
        ]);
    }
}
