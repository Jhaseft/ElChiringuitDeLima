<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\AccountOwner;
use App\Models\Bank;
use App\Models\Transfer;
use App\Models\TipoCambio;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Throwable;
use App\Models\Configuracion;
use App\Helpers\AppLog;
use App\Jobs\SubirComprobantesTransferencia;
use App\Jobs\EnviarWhatsappTransferencia;
class OperacionController extends Controller
{
    public function listarBancos()
    {
        // Bancos casi nunca cambian: cache 24 h. Se invalida via BankObserver.
        return response()->json(
            Cache::remember('bancos_all', now()->addHours(24), fn() => Bank::all())
        );
    }


    public function eliminarcuenta(Request $request, $account_id)
    {
        // Solo el dueño de la cuenta puede desactivarla.
        $account = Account::where('id', $account_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Cuenta no encontrada'
            ], 404);
        }

        $account->update([
            'desactivate' => 1
        ]);

        Cache::forget("cuentas:user:{$account->user_id}:{$account->method_type}");

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
            'method_type' => 'nullable|in:bank,qr',
        ]);

        // El dueño de la cuenta es SIEMPRE el usuario autenticado.
        // Nunca se confía en un user_id enviado por el cliente (evita crear
        // cuentas a nombre de otros usuarios).
        $request->merge(['user_id' => $request->user()->id]);

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

            try {
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
            } catch (\Throwable $e) {
                AppLog::error('Error al crear cuenta QR en DB', ['user_id' => $request->user_id, 'error' => $e->getMessage()], 'cuentas');
                return response()->json(['message' => 'Error al guardar la cuenta QR.'], 500);
            }

            Cache::forget("cuentas:user:{$request->user_id}:qr");

            return response()->json($account);
        }

        // =========================
        //  CASO BANK
        // =========================
        $request->validate([
            'bank_id' => 'required|exists:banks,id',
            'account_number' => ['required', 'string', 'regex:/^\d{6,20}$/'],
            'account_type' => 'required|in:origin,destination',
        ], [
            'account_number.regex' => 'El número de cuenta solo puede contener números (6 a 20 dígitos).',
        ]);

        $ownerId = null;

        // SOLO destination crea owner
        if ($request->account_type === 'destination') {

            $request->validate([
                'owner_full_name' => ['required', 'string', 'min:3', 'max:60', 'regex:/^[\pL\s\'’\-]+$/u'],
                'owner_document'  => ['required', 'string', 'regex:/^\d{5,20}$/'],
                'owner_phone'     => ['required', 'string', 'regex:/^\+?\d{7,20}$/'],
            ], [
                'owner_full_name.regex' => 'El nombre del titular solo puede contener letras.',
                'owner_document.regex'  => 'El documento solo puede contener números.',
                'owner_phone.regex'     => 'El teléfono solo puede contener números.',
            ]);

            try {
                $owner = AccountOwner::create([
                    'full_name' => $request->owner_full_name,
                    'document_number' => $request->owner_document,
                    'phone' => $request->owner_phone,
                ]);
                $ownerId = $owner->id;
            } catch (\Throwable $e) {
                AppLog::error('Error al crear AccountOwner', ['user_id' => $request->user_id, 'error' => $e->getMessage()], 'cuentas');
                return response()->json(['message' => 'Error al guardar el titular de la cuenta.'], 500);
            }
        }

        try {
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
                    'qr_value' => null,
                    'qr_country' => null,
                    'desactivate' => 0,
                ]
            );
        } catch (\Throwable $e) {
            AppLog::error('Error al guardar cuenta bancaria', ['user_id' => $request->user_id, 'bank_id' => $request->bank_id, 'account_number' => $request->account_number, 'error' => $e->getMessage()], 'cuentas');
            return response()->json(['message' => 'Error al guardar la cuenta bancaria.'], 500);
        }

        Cache::forget("cuentas:user:{$request->user_id}:bank");

        return response()->json($account);
    }

    public function listarCuentas(Request $request, $user_id, $method_type)
    {
        // Se ignora el {user_id} de la URL: solo se devuelven las cuentas del
        // usuario autenticado (evita IDOR / enumeración de cuentas ajenas).
        $accounts = Account::with(['bank', 'owner'])
            ->where('user_id', $request->user()->id)
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

    // Resumen del usuario para el home: total de operaciones completadas,
    // soles cambiados y bolivianos cambiados. Se usa el usuario autenticado
    // (se ignora cualquier user_id del cliente para evitar IDOR).
    //
    // Semántica de montos según modo:
    //   PENtoBOB → paga en soles (amount = PEN), recibe bolivianos (converted_amount = BOB).
    //   BOBtoPEN → paga en bolivianos (amount = BOB), recibe soles (converted_amount = PEN).
    public function resumen(Request $request)
    {
        $userId = $request->user()->id;

        // Cache por-usuario (TTL 10 min). Se invalida al completar una
        // transferencia (AdminTransfers::update), que es cuando cambian los totales.
        $data = Cache::remember("resumen:user:{$userId}", now()->addMinutes(10), function () use ($userId) {
            $stats = Transfer::where('user_id', $userId)
                ->where('status', 'completed')
                ->selectRaw('COUNT(*) as total_operaciones')
                ->selectRaw("COALESCE(SUM(CASE WHEN modo = 'PENtoBOB' THEN amount ELSE converted_amount END), 0) as soles")
                ->selectRaw("COALESCE(SUM(CASE WHEN modo = 'PENtoBOB' THEN converted_amount ELSE amount END), 0) as bolivianos")
                ->first();

            return [
                'total_operaciones'    => (int) $stats->total_operaciones,
                'soles_cambiados'      => round((float) $stats->soles, 2),
                'bolivianos_cambiados' => round((float) $stats->bolivianos, 2),
            ];
        });

        return response()->json($data);
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

            // Las cuentas referenciadas deben pertenecer al usuario autenticado
            // (no basta con que existan: evita adjuntar cuentas de terceros).
            $ownedAccount = fn() => Rule::exists('accounts', 'id')->where('user_id', $user->id);

            // Lado bancario obligatorio según modo + qué id puede ir
            if ($modo === 'PENtoBOB') {
                // Cliente paga por banco PE (origen obligatorio).
                // Destino solo aplica si recibe por QR (id del QR del usuario).
                $rules['origin_account_id']      = ['required', $ownedAccount()];
                // Aunque en efectivo el destino es opcional, si viene un id DEBE
                // ser una cuenta del propio usuario (evita adjuntar cuentas ajenas).
                $rules['destination_account_id'] = $slug === 'qr'
                    ? ['required', $ownedAccount(), 'different:origin_account_id']
                    : ['nullable', $ownedAccount()];
            } else { // BOBtoPEN
                // Cliente recibe en banco PE (destino obligatorio).
                // Si paga por QR, manda la cuenta BO desde la que paga (opcional en backend, frontend lo enforce).
                // Si paga en efectivo, origen es null.
                $rules['origin_account_id']      = ['nullable', $ownedAccount()];
                $rules['destination_account_id'] = ['required', $ownedAccount()];
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

            // Validar máximo por modo (control de cordura, configurable desde el
            // panel). Si el valor es 0 / no está configurado, no se aplica tope.
            $maxPen = (float) Configuracion::get('transfer_max_pen', 0);
            if ($modo === 'PENtoBOB' && $maxPen > 0 && $amount > $maxPen) {
                return response()->json([
                    'message' => 'El monto máximo para transferencias PEN→BOB es S/ ' . $maxPen . '.'
                ], 422);
            }

            $maxBob = (float) Configuracion::get('transfer_max_bob', 0);
            if ($modo === 'BOBtoPEN' && $maxBob > 0 && $amount > $maxBob) {
                return response()->json([
                    'message' => 'El monto máximo para transferencias BOB→PEN es Bs ' . $maxBob . '.'
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

            // 1) Guardar los comprobantes en disco temporal (rápido). La subida a
            //    Cloudinary se hace en un Job por detrás (no bloquea el request).
            $tempPaths = [];
            if ($request->hasFile('comprobantes')) {
                foreach ($request->file('comprobantes') as $file) {
                    $tempPaths[] = $file->store('tmp/comprobantes/' . $user->id, 'local');
                }
            }

            // 2) Crear la transferencia (pending). Los comprobantes se adjuntan luego
            //    vía Job; la operación nace válida y no se pierde si la subida falla.
            try {
                $transfer = DB::transaction(function () use (
                    $user,
                    $paymentMethod,
                    $request,
                    $exchangeRate,
                    $convertedAmount
                ) {
                    return Transfer::create([
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

            // Subir comprobantes a Cloudinary por detrás (no bloquea el request).
            if (!empty($tempPaths)) {
                SubirComprobantesTransferencia::dispatch($transfer->id, $tempPaths, $user->id);
            }

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

            // Aviso por WhatsApp (Evolution API) en background: antes se hacía dentro
            // del request (HTTP con timeout de 10 s por número) y lo hacía lento.
            EnviarWhatsappTransferencia::dispatch($transfer->id);

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
