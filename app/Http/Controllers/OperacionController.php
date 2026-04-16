<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\AccountOwner;
use App\Models\Bank;
use App\Models\Transfer;
use App\Models\TipoCambio;
use App\Models\TransactionReceipt;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Support\Facades\Log;

class OperacionController extends Controller
{
    public function listarBancos()
    {
        return response()->json(Bank::all());
    }

    
    public function guardarCuenta(Request $request)
{
    // VALIDACIÓN BASE
    $request->validate([
        'user_id' => 'required|exists:users,id',
        'method_type' => 'nullable|in:bank,qr',
    ]);

    // Si no se envía method_type, se asume 'bank'
    $methodType = $request->method_type ?? 'bank';

    // =========================
    // CASO QR
    // =========================
    if ($methodType === 'qr') {

        $request->validate([
            'qr_image'   => 'required|file|mimes:jpg,jpeg,png|max:5120',
            'qr_country' => 'required|in:PE,BO',
        ]);

        try {
            $uploadApi  = new UploadApi();
            $uploaded   = $uploadApi->upload(
                $request->file('qr_image')->getRealPath(),
                [
                    'folder'        => 'cuentas/qr/' . $request->user_id,
                    'resource_type' => 'image',
                ]
            );
            $qrUrl = $uploaded['secure_url'];
        } catch (\Exception $e) {
            Log::error('❌ Error subiendo QR a Cloudinary', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Error subiendo la imagen QR. Intenta nuevamente.'], 500);
        }

        $account = Account::updateOrCreate(
            [
                'user_id'     => $request->user_id,
                'method_type' => 'qr',
                'qr_country'  => $request->qr_country,
            ],
            [
                'qr_value'       => $qrUrl,
                'bank_id'        => null,
                'account_number' => null,
                'owner_id'       => null,
            ]
        );
 
        return response()->json($account);
    }

    // =========================
    //  CASO BANK
    // =========================
    $request->validate([
        'bank_id' => 'required|exists:banks,id',
        'account_number' => 'required|string',
        'account_type' => 'required|in:origin,destination',
    ]);

    $ownerId = null;

    // SOLO destination crea owner
    if ($request->account_type === 'destination') {

        $request->validate([
            'owner_full_name' => 'required|string',
            'owner_document' => 'required|string',
            'owner_phone' => 'required|string',
        ]);

        $owner = AccountOwner::create([
            'full_name' => $request->owner_full_name,
            'document_number' => $request->owner_document,
            'phone' => $request->owner_phone,
        ]);

        $ownerId = $owner->id;
    }

    $account = Account::updateOrCreate(
        [
            'user_id' => $request->user_id,
            'method_type' => 'bank',
            'account_number' => $request->account_number,
        ],
        [
            'bank_id' => $request->bank_id,
            'account_type' => $request->account_type,
            'owner_id' => $ownerId,

            // limpiar QR
            'qr_value' => null,
            'qr_country' => null,
        ]
    );
 
    return response()->json($account);
}

    public function listarCuentas($user_id, $method_type)
{
    $accounts = Account::with(['bank', 'owner'])
        ->where('user_id', $user_id)
        ->where('method_type', $method_type)
        ->get();

    if ($method_type === 'bank') {
        $accounts = $accounts->map(function ($a) {
            return [
                'id' => $a->id,
                'account_number' => $a->account_number,
                'account_type' => $a->account_type,
                'bank_id' => $a->bank?->id,
                'bank_name' => $a->bank?->name,
                'bank_logo' => $a->bank?->logo_url,
                'owner_full_name' => $a->owner?->full_name,
                'owner_document' => $a->owner?->document_number,
                'owner_phone' => $a->owner?->phone,
            ];
        });

    } elseif ($method_type === 'qr') {
        $accounts = $accounts->map(function ($a) {
            return [
                'id' => $a->id,
                'qr_value' => $a->qr_value,
                'qr_country' => $a->qr_country,
            ];
        });
    } else {
        return response()->json([
            'error' => 'Método no válido'
        ], 400);
    }

    Log::info('Cuentas listadas', [
        'user_id' => $user_id,
        'method_type' => $method_type,
        'count' =>  ['accounts' => $accounts],
    ]);

    return response()->json($accounts);
}

    public function crearTransferencia(Request $request)
    {

        // Usuario autenticado
        $user = $request->user();

        // Verificación KYC
        // if ($user->kyc_status !== 'verified') {
        //     return response()->json([
        //         'message' => 'Debes completar la verificación KYC antes de crear una transferencia.'
        //     ], 403); 
        // }


        $isEfectivo = $request->payment_method_slug === 'cash';
        $isQR       = $request->payment_method_slug === 'qr';

        // Validación (exchange_rate y converted_amount se calculan en el backend)
        $validated = $request->validate([
            'origin_account_id'       => ($isEfectivo || $isQR) ? ['nullable'] : ['required','exists:accounts,id'],
            'destination_account_id'  => ($isEfectivo || $isQR) ? ['nullable'] : ['required','exists:accounts,id','different:origin_account_id'],
            'amount'                  => ['required','numeric','min:0.01'],
            'comprobantes'            => ['nullable','array','max:5'],
            'comprobantes.*'          => ['file','mimes:jpg,jpeg,png,pdf','max:5120'],
            'modo'                    => ['required','in:BOBtoPEN,PENtoBOB'],
            'payment_method_slug'     => ['nullable','string','exists:payment_methods,slug'],
        ]);

        // Validar mínimos según modo (valores desde .env vía config/transfercash.php)
        $amount = (float) $request->amount;
        $modo   = $request->modo;

        if ($modo === 'PENtoBOB' && $amount < config('transfercash.min_pen')) {
            return response()->json([
                'message' => 'El monto mínimo para transferencias PEN→BOB es S/ ' . config('transfercash.min_pen') . '.'
            ], 422);
        }

        if ($modo === 'BOBtoPEN' && $amount < config('transfercash.min_bob')) {
            return response()->json([
                'message' => 'El monto mínimo para transferencias BOB→PEN es Bs ' . config('transfercash.min_bob') . '.'
            ], 422);
        }

        // Validar límite KYC según modo (valores desde .env vía config/transfercash.php)
        $superaLimiteKyc =
            ($modo === 'PENtoBOB' && $amount > config('transfercash.kyc_limit_pen')) ||
            ($modo === 'BOBtoPEN' && $amount > config('transfercash.kyc_limit_bob'));

        if ($superaLimiteKyc && $user->kyc_status !== 'verified') {
            $limite   = $modo === 'PENtoBOB'
                ? 'S/ ' . config('transfercash.kyc_limit_pen')
                : 'Bs ' . config('transfercash.kyc_limit_bob');
            return response()->json([
                'message' => "Para transferencias superiores a {$limite} debes completar la verificación KYC.",
                'kyc_required' => true,
            ], 403);
        }

        // Obtener el tipo de cambio vigente desde la BD (nunca del cliente)
        $tipoCambio = TipoCambio::latest()->first();
        if (!$tipoCambio) {
            return response()->json(['message' => 'No hay tipo de cambio configurado. Contacte al administrador.'], 422);
        }

        if ($modo === 'BOBtoPEN') {
            $exchangeRate    = (float) $tipoCambio->venta;
            $convertedAmount = round($request->amount / $exchangeRate, 2);
            $depositCurrency = 'BOB';
            $receiveCurrency = 'PEN';
        } else { // PENtoBOB
            $exchangeRate    = (float) $tipoCambio->compra;
            $convertedAmount = round($request->amount * $exchangeRate, 2);
            $depositCurrency = 'PEN';
            $receiveCurrency = 'BOB';
        }


        $paymentMethod = \App\Models\PaymentMethod::where(
            'slug', $request->payment_method_slug ?? 'bank_transfer'
        )->first();

        $transfer = Transfer::create([
            'user_id'                => $user->id,
            'payment_method_id'      => $paymentMethod?->id,
            'origin_account_id'      => $request->origin_account_id ?? null,
            'destination_account_id' => $request->destination_account_id ?? null,
            'amount'                 => $request->amount,
            'exchange_rate'          => $exchangeRate,
            'converted_amount'       => $convertedAmount,
            'modo'                   => $request->modo,
            'status'                 => 'pending',
        ]);

        // Subir múltiples comprobantes a Cloudinary y guardar en transaction_receipts
        if ($request->hasFile('comprobantes')) {
            $uploadApi = new UploadApi();
            $firstUrl = null;

            foreach ($request->file('comprobantes') as $file) {
                try {
                    $uploaded = $uploadApi->upload(
                        $file->getRealPath(),
                        [
                            'folder' => 'transferencias/comprobantes/'.$user->id,
                            'resource_type' => 'auto'
                        ]
                    );

                    $url = $uploaded['secure_url'];
                    if (!$firstUrl) $firstUrl = $url;

                    TransactionReceipt::create([
                        'transaction_id' => $transfer->id,
                        'receipt_url'    => $url,
                        'receipt_type'   => 'client',
                        'uploaded_by'    => $user->id,
                    ]);

                } catch (\Exception $e) {
                    Log::error('❌ Error subiendo comprobante a Cloudinary', [
                        'message' => $e->getMessage()
                    ]);
                }
            }

        }



        // Cargar relaciones
        $transfer->load([
            'originAccount.bank',
            'originAccount.owner',
            'destinationAccount.bank',
            'destinationAccount.owner',
            'user',
        ]);

        // Número de operación
        $transferNumber = 'OP-' . str_pad($transfer->id, 5, '0', STR_PAD_LEFT);

        // Payload común (para mails)
        $payload = [
            'transfer'        => $transfer,
            'transferNumber'  => $transferNumber,
            'depositCurrency' => $depositCurrency,
            'receiveCurrency' => $receiveCurrency,
            'convertedAmount' => $convertedAmount,
        ];

        // Enviar mails
        // Mail::to("operaciones@transfercash.click")->send(new \App\Mail\NuevaTransferenciaAdmin($payload));
        // Mail::to($user->email)->send(new \App\Mail\NuevaTransferenciaUsuario($payload));

    // //  Enviar mensaje ya armado a n8n (para Evolution API)
    // try {
    //     $paymentSlug = $request->payment_method_slug ?? 'bank_transfer';

    //     $mensaje = "📌 *Nueva transferencia registrada*\n\n".
    //             "📝 *Detalles de la operación*\n".
    //             "• Número de operación: {$transferNumber}\n".
    //             "• Fecha: {$transfer->created_at->format('d/m/Y H:i')}\n".
    //             "• Método de pago: {$paymentSlug}\n".
    //             "• Tipo de cambio aplicado: {$transfer->exchange_rate}\n\n".

    //             "💰 *Depósito recibido*\n".
    //             "• Monto recibido: ".number_format($transfer->amount, 2)." {$depositCurrency}\n";

    //     if ($transfer->originAccount?->bank) {
    //         $mensaje .= "• Banco origen: {$transfer->originAccount->bank->name}\n".
    //                     "• Número de cuenta origen: {$transfer->originAccount->account_number}\n";
    //     } elseif ($transfer->originAccount?->qr_value) {
    //         $mensaje .= "• Cuenta origen (QR): país {$transfer->originAccount->qr_country}\n";
    //     }

    //     $mensaje .= "\n👤 *Cliente*\n".
    //             "• Nombre: {$user->first_name} {$user->last_name}\n".
    //             "• Email: {$user->email}\n".
    //             "• Teléfono: ".($user->phone ?? 'N/D')."\n".
    //             "• Nacionalidad: ".ucfirst($user->nationality ?? 'N/D')."\n".
    //             "• Documento: ".($user->document_number ?? 'N/D')."\n\n".

    //             "📤 *Monto a enviar*\n".
    //             "• Monto convertido: ".number_format($convertedAmount, 2)." {$receiveCurrency}\n";

    //     if ($transfer->destinationAccount?->bank) {
    //         $mensaje .= "• Banco destino: {$transfer->destinationAccount->bank->name}\n".
    //                     "• Número de cuenta destino: {$transfer->destinationAccount->account_number}\n\n";

    //         if ($transfer->destinationAccount->owner) {
    //             $destOwner = $transfer->destinationAccount->owner;
    //             $mensaje .= "👤 *Titular de la cuenta destino*\n".
    //                         "• Nombre: ".($destOwner->full_name ?? 'N/D')."\n".
    //                         "• Documento: ".($destOwner->document_number ?? 'N/D')."\n".
    //                         "• Teléfono: ".($destOwner->phone ?? 'N/D')."\n".
    //                         "• Email: ".($destOwner->email ?? 'N/D')."\n\n";
    //         }
    //     } elseif ($transfer->destinationAccount?->qr_value) {
    //         $mensaje .= "• Cuenta destino (QR): país {$transfer->destinationAccount->qr_country}\n".
    //                     "• URL QR: {$transfer->destinationAccount->qr_value}\n\n";
    //     }

    //     $mensaje .= "📎 *Comprobante*: verificar en los Mails.\n\n".
    //                 "🔗 Ir al panel de administración para mas detalles:\n".
    //                 url('/admin/login');
    
    //     // Configuración Evolution API
    //     $server   = "https://servicios-evolution-api.b5lsqc.easypanel.host";
    //     $instance = "JHASEFT";
    //     $apikey   = "80DB5110EBBF-4B03-9272-CA011C2902EF"; // Apikey admin

    //     $numeros = [
    //         '59160759245', // nuevo número
    //     ];


    //     foreach ($numeros as $numero) {
    //         $whatsPayload = [
    //             'number' => $numero,
    //             'text'   => $mensaje,
    //         ];

    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //             'apikey'       => $apikey,
    //         ])->post("$server/message/sendText/$instance", $whatsPayload);

    //         if ($response->failed()) {
    //                 Log::error("❌ Error enviando a {$numero}: ".$response->body());
    //         } 
    //     }

    // } catch (\Exception $e) {
    //     Log::error("❌ Excepción enviando mensaje a Evolution API: ".$e->getMessage());
    // }


        return response()->json([
            'transfer'        => $transfer,
            'transfer_number' => $transferNumber,
        ]);
    }
    
}
