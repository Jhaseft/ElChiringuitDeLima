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
use Illuminate\Support\Facades\DB;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Support\Facades\Log;
use Throwable;
use App\Models\Configuracion;
use App\Helpers\AppLog;
class OperacionController extends Controller
{
    public function listarBancos()
    {
        return response()->json(Bank::all());
    }


    public function eliminarcuenta($account_id)
    {
        $account = Account::find($account_id);

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Cuenta no encontrada'
            ], 404);
        }

        $account->update([
            'desactivate' => 1
        ]);


        return response()->json([
            'success' => true,
            'message' => 'Cuenta desactivada correctamente',
            'data' => $account
        ]);
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
                AppLog::error('Error subiendo QR a Cloudinary', ['error' => $e->getMessage()], 'cuentas');
                return response()->json(['message' => 'Error subiendo la imagen QR. Intenta nuevamente.'], 500);
            }

            Account::where('user_id', $request->user_id)
                ->where('method_type', 'qr')
                ->where('qr_country', $request->qr_country)
                ->where('desactivate', 0)
                ->update(['desactivate' => 1]);

            $account = Account::create([
                'user_id'        => $request->user_id,
                'method_type'    => 'qr',
                'qr_country'     => $request->qr_country,
                'qr_value'       => $qrUrl,
                'bank_id'        => null,
                'account_number' => null,
                'owner_id'       => null,
                'desactivate'    => 0,
            ]);

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
            ->where('desactivate', false)
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

        return response()->json($accounts);
    }

    public function crearTransferencia(Request $request)
    {
        try {
            // Usuario autenticado
            $user = $request->user();

            $modo = $request->modo;
            $slug = $request->payment_method_slug;

            // Reglas base
            // payment_method_slug = cómo NOSOTROS entregamos al cliente.
            //   PENtoBOB → cash | qr (lado boliviano elegido por el cliente)
            //   BOBtoPEN → bank_transfer (siempre depositamos a su cuenta PE)
            // Comprobantes: opcional cuando BOBtoPEN + efectivo (sin origin_account_id).
            // El cliente pagó en oficina; el admin adjunta el comprobante al confirmar.
            $comprobantesOpcional = $modo === 'BOBtoPEN' && empty($request->origin_account_id);

            $rules = [
                'amount'              => ['required', 'numeric', 'min:0.01'],
                'comprobantes'        => $comprobantesOpcional
                    ? ['nullable', 'array', 'max:5']
                    : ['required', 'array', 'min:1', 'max:5'],
                'comprobantes.*'      => ['file', 'mimes:jpg,jpeg,png', 'max:5120'],
                'modo'                => ['required', 'in:BOBtoPEN,PENtoBOB'],
                'payment_method_slug' => [
                    'required',
                    'exists:payment_methods,slug',
                    $modo === 'PENtoBOB' ? 'in:cash,qr' : 'in:bank_transfer',
                ],
            ];

            // Lado bancario obligatorio según modo + qué id puede ir
            if ($modo === 'PENtoBOB') {
                // Cliente paga por banco PE (origen obligatorio).
                // Destino solo aplica si recibe por QR (id del QR del usuario).
                $rules['origin_account_id']      = ['required', 'exists:accounts,id'];
                $rules['destination_account_id'] = $slug === 'qr'
                    ? ['required', 'exists:accounts,id', 'different:origin_account_id']
                    : ['nullable'];
            } else { // BOBtoPEN
                // Cliente recibe en banco PE (destino obligatorio).
                // Si paga por QR, manda la cuenta BO desde la que paga (opcional en backend, frontend lo enforce).
                // Si paga en efectivo, origen es null.
                $rules['origin_account_id']      = ['nullable', 'exists:accounts,id'];
                $rules['destination_account_id'] = ['required', 'exists:accounts,id'];
            }

            $validated = $request->validate($rules);

            // Validar mínimos según modo (valores desde .env vía config/transfercash.php)
            $amount = (float) $request->amount;
            $modo   = $request->modo;
 
            if ($modo === 'PENtoBOB' && $amount < Configuracion::get('transfer_min_pen', 0)) {
                return response()->json([
                    'message' => 'El monto mínimo para transferencias PEN→BOB es S/ ' . Configuracion::get('transfer_min_pen', 0) . '.'
                ], 422);
            }

            if ($modo === 'BOBtoPEN' && $amount < Configuracion::get('transfer_min_bob', 0)) {
                return response()->json([
                    'message' => 'El monto mínimo para transferencias BOB→PEN es Bs ' . Configuracion::get('transfer_min_bob', 0) . '.'
                ], 422);
            }

            // Validar límite KYC según modo (valores desde .env vía config/transfercash.php)
            $superaLimiteKyc =
                ($modo === 'PENtoBOB' && $amount > Configuracion::get('transfer_kyc_limit_pen', 0)) ||
                ($modo === 'BOBtoPEN' && $amount > Configuracion::get('transfer_kyc_limit_bob', 0));

            if ($superaLimiteKyc && $user->kyc_status !== 'verified') {
                $limite   = $modo === 'PENtoBOB'
                    ? 'S/ ' . Configuracion::get('transfer_kyc_limit_pen', 0)
                    : 'Bs ' . Configuracion::get('transfer_kyc_limit_bob', 0);
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


            $paymentSlug   = $request->payment_method_slug ?? 'bank_transfer';
            $paymentMethod = \App\Models\PaymentMethod::where('slug', $paymentSlug)->first();

            // 1) Subir comprobantes a Cloudinary ANTES de tocar la BD.
            //    Si algo falla aquí, no queda ningún registro huérfano.
            $uploadedUrls = [];
            if ($request->hasFile('comprobantes')) {
                $uploadApi = new UploadApi();

                foreach ($request->file('comprobantes') as $file) {
                    try {
                        $uploaded = $uploadApi->upload(
                            $file->getRealPath(),
                            [
                                'folder'        => 'transferencias/comprobantes/' . $user->id,
                                'resource_type' => 'auto',
                            ]
                        );
                        $uploadedUrls[] = $uploaded['secure_url'];
                    } catch (\Exception $e) {
                        Log::error('❌ Error subiendo comprobante a Cloudinary', [
                            'user_id' => $user->id,
                            'message' => $e->getMessage(),
                        ]);
                        AppLog::error('Error subiendo comprobante a Cloudinary', [
                            'error' => $e->getMessage(),
                        ], 'transferencia');
                        return response()->json([
                            'message' => 'No se pudo subir uno de los comprobantes. Intenta nuevamente.',
                        ], 502);
                    }
                }
            }

            // 2) Crear Transfer + receipts dentro de una transacción atómica.
            try {
                $transfer = DB::transaction(function () use (
                    $user,
                    $paymentMethod,
                    $request,
                    $exchangeRate,
                    $convertedAmount,
                    $uploadedUrls
                ) {
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

                    foreach ($uploadedUrls as $url) {
                        TransactionReceipt::create([
                            'transaction_id' => $transfer->id,
                            'receipt_url'    => $url,
                            'receipt_type'   => 'client',
                            'uploaded_by'    => $user->id,
                        ]);
                    }

                    return $transfer;
                });
            } catch (Throwable $e) {
                Log::error('❌ Error creando transferencia en BD', [
                    'user_id' => $user->id,
                    'message' => $e->getMessage(),
                ]);
                AppLog::error('Error creando transferencia en BD', [
                    'error' => $e->getMessage(),
                    'monto' => $request->amount,
                    'modo'  => $request->modo,
                ], 'transferencia');
                return response()->json([
                    'message' => 'No se pudo registrar la transferencia. Intenta nuevamente.',
                ], 500);
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
                'transfer'           => $transfer,
                'transferNumber'     => $transferNumber,
                'depositCurrency'    => $depositCurrency,
                'receiveCurrency'    => $receiveCurrency,
                'convertedAmount'    => $convertedAmount,
                'paymentMethodSlug'  => $paymentSlug,
                'paymentMethodName'  => $paymentMethod?->name ?? ucfirst($paymentSlug),
            ];


            try {
                Mail::to("operaciones@transfercash.click")->send(new \App\Mail\NuevaTransferenciaAdmin($payload));
                Mail::to($user->email)->send(new \App\Mail\NuevaTransferenciaUsuario($payload));
            } catch (\Throwable $e) {
                AppLog::error('Error enviando email de transferencia', [
                    'transfer_id' => $transfer->id,
                    'error'       => $e->getMessage(),
                ], 'transferencia');
            }

            //  Enviar mensaje a WhatsApp vía Evolution API (diferenciado por método de pago)
            try {
                $fecha = $transfer->created_at->format('d/m/Y H:i');

                $mensaje  = "📌 *Nueva transferencia registrada*\n\n";
                $mensaje .= "📝 *Detalles de la operación*\n";
                $mensaje .= "• Número de operación: {$transferNumber}\n";
                $mensaje .= "• Fecha: {$fecha}\n";
                $mensaje .= "• Método de pago: " . ($paymentMethod?->name ?? ucfirst($paymentSlug)) . "\n";
                $mensaje .= "• Tipo de cambio aplicado: {$transfer->exchange_rate}\n\n";

                // === Bloque de PAGO (cómo nos paga el cliente) ===
                $mensaje .= "💳 *Pago del cliente*\n";
                $mensaje .= "• Monto: " . number_format($transfer->amount, 2) . " {$depositCurrency}\n";

                if ($modo === 'PENtoBOB') {
                    // Cliente siempre paga por banco PE
                    $mensaje .= "• Método: Transferencia bancaria PE\n";
                    if ($transfer->originAccount?->bank) {
                        $mensaje .= "• Banco origen: {$transfer->originAccount->bank->name}\n";
                        $mensaje .= "• Número de cuenta origen: {$transfer->originAccount->account_number}\n";
                    }
                } else { // BOBtoPEN
                    if ($paymentSlug === 'cash') {
                        $mensaje .= "• Método: Efectivo en oficina (BOB)\n";
                        $mensaje .= "• El cliente debe haber pagado en oficina.\n";
                    } elseif ($paymentSlug === 'qr') {
                        $mensaje .= "• Método: QR de la empresa (BOB)\n";
                        $mensaje .= "• El cliente escaneó nuestro QR de Bolivia para pagar.\n";
                        if ($transfer->originAccount?->bank) {
                            $mensaje .= "• Banco origen (BO): {$transfer->originAccount->bank->name}\n";
                            $mensaje .= "• Número de cuenta origen: {$transfer->originAccount->account_number}\n";
                        }
                    }
                }
                $mensaje .= "\n";

                // === Cliente ===
                $mensaje .= "👤 *Cliente*\n";
                $mensaje .= "• Nombre: {$user->first_name} {$user->last_name}\n";
                $mensaje .= "• Email: {$user->email}\n";
                $mensaje .= "• Teléfono: " . ($user->phone ?? 'N/D') . "\n";
                $mensaje .= "• Nacionalidad: " . ucfirst($user->nationality ?? 'N/D') . "\n";
                $mensaje .= "• Documento: " . ($user->document_number ?? 'N/D') . "\n\n";

                // === Bloque de ENTREGA (cómo recibe el cliente) ===
                $mensaje .= "📤 *Entrega al cliente*\n";
                $mensaje .= "• Monto: " . number_format($convertedAmount, 2) . " {$receiveCurrency}\n";

                if ($modo === 'BOBtoPEN') {
                    // Cliente siempre recibe en banco PE
                    $mensaje .= "• Método: Transferencia a cuenta PE del cliente\n";
                    if ($transfer->destinationAccount?->bank) {
                        $mensaje .= "• Banco destino: {$transfer->destinationAccount->bank->name}\n";
                        $mensaje .= "• Número de cuenta destino: {$transfer->destinationAccount->account_number}\n";

                        if ($transfer->destinationAccount->owner) {
                            $destOwner = $transfer->destinationAccount->owner;
                            $mensaje .= "\n👤 *Titular de la cuenta destino*\n";
                            $mensaje .= "• Nombre: " . ($destOwner->full_name ?? 'N/D') . "\n";
                            $mensaje .= "• Documento: " . ($destOwner->document_number ?? 'N/D') . "\n";
                            $mensaje .= "• Teléfono: " . ($destOwner->phone ?? 'N/D') . "\n";
                        }
                    }
                } else { // PENtoBOB
                    if ($paymentSlug === 'cash') {
                        $mensaje .= "• Método: Efectivo en oficina (BOB)\n";
                        $mensaje .= "• Coordinar entrega del efectivo al cliente.\n";
                    } elseif ($paymentSlug === 'qr') {
                        $mensaje .= "• Método: QR del cliente (BOB)\n";
                        if ($transfer->destinationAccount?->qr_value) {
                            $mensaje .= "• País QR destino: {$transfer->destinationAccount->qr_country}\n";
                            $mensaje .= "• URL QR destino: {$transfer->destinationAccount->qr_value}\n";
                        }
                    }
                }
                $mensaje .= "\n";

                $mensaje .= "📎 *Comprobante*: verificar en los Mails.\n\n";
                $mensaje .= "🔗 Ir al panel de administración:\n" . url('/admin/login');


                // Configuración Evolution API
                $server   = config('services.evolution.server',   env('EVOLUTION_SERVER'));
                $instance = config('services.evolution.instance', env('EVOLUTION_INSTANCE'));
                $apikey   = config('services.evolution.apikey',   env('EVOLUTION_APIKEY'));
                $numerosRaw = config('services.evolution.numbers', env('EVOLUTION_NUMBERS', ''));

                if ($server && $instance && $apikey && $numerosRaw) {
                    $numeros = array_filter(array_map('trim', explode(',', $numerosRaw)));

                    foreach ($numeros as $numero) {
                        $whatsPayload = [
                            'number' => $numero,
                            'text'   => $mensaje,
                        ];

                        $response = Http::timeout(10)->withHeaders([
                            'Content-Type' => 'application/json',
                            'apikey'       => $apikey,
                        ])->post("$server/message/sendText/$instance", $whatsPayload);

                        if ($response->failed()) {
                            Log::error("❌ Error enviando WhatsApp a {$numero}", [
                                'status' => $response->status(),
                                'body'   => $response->body(),
                            ]);
                            AppLog::warning('Error enviando WhatsApp', [
                                'numero' => $numero,
                                'status' => $response->status(),
                            ], 'whatsapp');
                        }
                    }
                } else {
                    Log::warning('⚠️ Evolution API no configurada (server/instance/apikey/numbers faltantes). WhatsApp omitido.');
                }
            } catch (\Exception $e) {
                Log::error("❌ Excepción enviando mensaje a Evolution API: " . $e->getMessage());
                AppLog::warning('Excepción enviando WhatsApp (Evolution API)', [
                    'transfer_id' => $transfer->id,
                    'error'       => $e->getMessage(),
                ], 'whatsapp');
            }

            return response()->json([
                'transfer'        => $transfer,
                'transfer_number' => $transferNumber,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Re-lanzar para que Laravel devuelva el 422 con los errores de validación.
            throw $e;
        } catch (Throwable $e) {
            Log::error('❌ Excepción no controlada en crearTransferencia', [
                'user_id' => $request->user()?->id,
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);
            AppLog::error('Excepción no controlada en crearTransferencia', [
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'monto' => $request->amount,
                'modo'  => $request->modo,
            ], 'transferencia');
            return response()->json([
                'message' => 'Ocurrió un error inesperado al procesar la transferencia. Intenta nuevamente.',
            ], 500);
        }
    }
}
