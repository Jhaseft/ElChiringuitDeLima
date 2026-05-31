<?php
 
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;
use App\Mail\TransferVerifiedMail; 
use Illuminate\Http\Request;
use App\Models\Transfer;
use App\Models\TransactionReceipt;
use App\Services\TcPuntosService;
use App\Services\ExpoPushService;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Cloudinary\Api\Upload\UploadApi;

class AdminTransfers extends Controller
{
    public function __construct(private ExpoPushService $push) {}

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
            'clientReceipts',
            'adminReceipts',
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
        'comprobantes'   => $isCash
            ? 'nullable|array|max:5'
            : 'nullable|array|max:5|required_if:status,completed',
        'comprobantes.*' => 'file|mimes:jpg,jpeg,png,pdf|max:5120',
    ]);

    // Si se completa y hay comprobantes → subir a Cloudinary
    if ($request->status === 'completed' && $request->hasFile('comprobantes')) {
        $uploadApi = new UploadApi();

        foreach ($request->file('comprobantes') as $file) {
            try {
                $uploaded = $uploadApi->upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'transferencias/admin/'.$transfer->id,
                        'resource_type' => 'auto'
                    ]
                );

                TransactionReceipt::create([
                    'transaction_id' => $transfer->id,
                    'receipt_url'    => $uploaded['secure_url'],
                    'receipt_type'   => 'admin',
                    'uploaded_by'    => $request->user()?->id,
                ]);

            } catch (\Exception $e) {
                Log::error('Error subiendo comprobante admin', [
                    'message' => $e->getMessage()
                ]);
            }
        }
    }

    // Actualizar estado
    $transfer->status = $request->status;
    $transfer->save();

    // Otorgar TC Puntos si se completó
    if ($transfer->status === 'completed') {
        app(TcPuntosService::class)->otorgarPuntos($transfer->fresh());
    }

    // Enviar correo si se completó (el mailable carga todos los comprobantes admin)
    if ($transfer->status === 'completed') {
        Mail::to($transfer->user->email)
            ->send(new TransferVerifiedMail($transfer));
    }

    // Push notification al usuario según el resultado
    $transfer->load('paymentMethod');
    $modo      = $transfer->modo;
    $amount    = number_format($transfer->amount, 2);
    $converted = number_format($transfer->converted_amount, 2);
    $slug      = $transfer->paymentMethod?->slug ?? 'bank_transfer';

    // PENtoBOB: envía S/, recibe Bs. — BOBtoPEN: envía Bs., recibe S/
    $sentCurrency = $modo === 'PENtoBOB' ? 'S/' : 'Bs.';
    $recvCurrency = $modo === 'PENtoBOB' ? 'Bs.' : 'S/';

    if ($transfer->status === 'completed') {
        $body = match (true) {
            $modo === 'PENtoBOB' && $slug === 'bank_transfer' =>
                "Tu envío de {$sentCurrency} {$amount} por transferencia fue procesado. Puedes verificar {$recvCurrency} {$converted} en tu cuenta.",
            $modo === 'PENtoBOB' && $slug === 'qr' =>
                "Tu envío de {$sentCurrency} {$amount} fue procesado. Puedes cobrar {$recvCurrency} {$converted} vía QR.",
            $modo === 'PENtoBOB' && $slug === 'cash' =>
                "Tu envío de {$sentCurrency} {$amount} fue procesado. Puedes recoger {$recvCurrency} {$converted} en nuestras oficinas.",
            $modo === 'BOBtoPEN' && $slug === 'bank_transfer' =>
                "Tu pago de {$sentCurrency} {$amount} por transferencia fue procesado. El destinatario recibirá {$recvCurrency} {$converted} en su cuenta.",
            $modo === 'BOBtoPEN' && $slug === 'qr' =>
                "Tu pago de {$sentCurrency} {$amount} vía QR fue procesado. El destinatario recibirá {$recvCurrency} {$converted} en su cuenta.",
            $modo === 'BOBtoPEN' && $slug === 'cash' =>
                "Tu pago de {$sentCurrency} {$amount} en efectivo fue procesado. El destinatario recibirá {$recvCurrency} {$converted} en su cuenta.",
            default =>
                "Tu envío de {$sentCurrency} {$amount} fue procesado exitosamente. ¡Gracias por usar Transfer Cash!",
        };

        $this->push->sendToUser(
            $transfer->user_id,
            'Transferencia aprobada ✔',
            $body,
            ['screen' => '/TransfersHistory']
        );
    } elseif ($transfer->status === 'rejected') {
        $this->push->sendToUser(
            $transfer->user_id,
            'Transferencia rechazada ✘',
            "Tu envío de {$sentCurrency} {$amount} no pudo ser procesado. Contáctanos si tienes dudas.",
            ['screen' => '/TransfersHistory']
        );
    }

    return response()->json($transfer);
}

   
}
