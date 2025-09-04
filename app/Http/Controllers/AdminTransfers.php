<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Mail;
use App\Mail\TransferVerifiedMail; // vamos a crear este Mailable
use Illuminate\Http\Request;
use App\Models\Transfer;

class AdminTransfers extends Controller
{
    // Listar todas las transferencias de forma amigable
 public function index(Request $request)
    {
        try {
            $perPage = (int) $request->query('perPage', 10);
            $search  = trim($request->query('search', ''));

            $query = Transfer::with([
                'user',
                'originAccount.bank',
                'destinationAccount.bank',
            ])->orderBy('created_at', 'desc');

            if ($search !== '') {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('first_name', 'LIKE', "$search%")
                      ->orWhere('last_name', 'LIKE', "$search%")
                      ->orWhere('email', 'LIKE', "$search%");
                })
                ->orWhereHas('originAccount', function ($q) use ($search) {
                    $q->where('account_number', 'LIKE', "$search%");
                })
                ->orWhereHas('destinationAccount', function ($q) use ($search) {
                    $q->where('account_number', 'LIKE', "$search%");
                })
                ->orWhere('status', 'LIKE', "$search%");
            }

            $transfers = $query->paginate($perPage);

            return response()->json($transfers);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    // Mostrar una transferencia específica
    public function show($id)
    {
        $transfer = Transfer::with(['user', 'originAccount.bank', 'originAccount.owner', 'destinationAccount.bank', 'destinationAccount.owner'])
            ->findOrFail($id);

        return response()->json($transfer);
    }

   
public function update(Request $request, $id)
{
    $transfer = Transfer::findOrFail($id);

    $request->validate([
        'status' => 'required|in:pending,verified,completed,rejected',
        'comprobante' => 'nullable|file|mimes:pdf,jpg,png|required_if:status,verified',
    ]);

    // Actualizar solo el estado
    $transfer->status = $request->status;
    $transfer->save();

    // Si el status es verified, enviar correo
    if ($transfer->status === 'completed') {
        $comprobante = null;

        // Guardar temporalmente el archivo para enviarlo
        if ($request->hasFile('comprobante')) {
            $comprobante = $request->file('comprobante');
        }

        // Pasar el archivo al Mailable (puedes manejarlo allí temporalmente)
        Mail::to($transfer->user->email)->send(new TransferVerifiedMail($transfer, $comprobante));
    }

    return response()->json($transfer);
}

   
}
