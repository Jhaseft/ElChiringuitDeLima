<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;
use App\Mail\TransferVerifiedMail; 
use Illuminate\Http\Request;
use App\Models\Transfer;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Cloudinary\Api\Upload\UploadApi;

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

        $transfers = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Efectivo', [
            'transfers' => $transfers,
            'filters'   => ['search' => $search, 'perPage' => $perPage],
        ]);
    }
}
