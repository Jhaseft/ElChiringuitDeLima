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

class AdminTransfers extends Controller
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
        ->whereHas('paymentMethod', fn($q) => $q->where('slug', 'bank_transfer'))
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

        return Inertia::render('Admin/Transferencias', [
            'transfers' => $transfers,
            'filters'   => ['search' => $search, 'perPage' => $perPage],
        ]);
    }



  // Mostrar usuario desde transferencia
public function showUser($id)
{
   

    $transfer = Transfer::with(['user'])
        ->findOrFail($id);

    return response()->json([
        'transfer_id' => $transfer->id,
        'user' => $transfer->user
    ]);
}

 // Mostrar detalle de transferencia
public function transferDetail($id)
{


    $transfer = Transfer::with([
        'originAccount.bank',
        'originAccount.owner',
        'destinationAccount.bank',
        'destinationAccount.owner'
    ])->findOrFail($id);

   

    return response()->json($transfer);
}

   

 
public function update(Request $request, $id)
{
    $transfer = Transfer::findOrFail($id);

    $isCash = $request->boolean('is_cash');

    $request->validate([
        'status' => 'required|in:pending,completed,rejected',
        'comprobante' => $isCash
            ? 'nullable|file|mimes:jpg,jpeg,png,pdf'
            : 'nullable|file|mimes:jpg,jpeg,png,pdf|required_if:status,completed',
    ]);

    // Si se completa y hay comprobante → subir a Cloudinary
    if ($request->status === 'completed' && $request->hasFile('comprobante')) {

        try {

            $uploadApi = new UploadApi();

            $uploaded = $uploadApi->upload(
                $request->file('comprobante')->getRealPath(),
                [
                    'folder' => 'transferencias/admin/'.$transfer->id,
                    'resource_type' => 'auto'
                ]
            );

            //  Guardamos la URL en admin_receipt
            $transfer->admin_receipt = $uploaded['secure_url'];

        } catch (\Exception $e) {

            Log::error('Error subiendo comprobante admin', [
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error subiendo el comprobante.'
            ], 500);
        }
    }

    // Actualizar estado
    $transfer->status = $request->status;
    $transfer->save();

    // Enviar correo si se completó
    if ($transfer->status === 'completed') {

        Mail::to($transfer->user->email)
            ->send(new TransferVerifiedMail($transfer, $transfer->admin_receipt));
    }

    return response()->json($transfer);
}

   
}
