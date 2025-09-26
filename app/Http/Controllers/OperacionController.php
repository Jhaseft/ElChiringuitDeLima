<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\AccountOwner;
use App\Models\Bank;
use App\Models\Transfer;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;

class OperacionController extends Controller
{
    public function listarBancos()
    {
        return response()->json(Bank::all());
    }

    public function guardarCuenta(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'bank_id' => 'required|exists:banks,id',
            'account_number' => 'required|string',
            'account_type' => 'required|in:origin,destination',
        ]);

        $ownerId = null;

        // SOLO crear owner si es destination
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
                'account_number' => $request->account_number,
                'account_type' => $request->account_type,
            ],
            [
                'bank_id' => $request->bank_id,
                'owner_id' => $ownerId,
            ]
        );

        return response()->json($account);
    }

    public function listarCuentas($user_id)
    {
        $accounts = Account::with('bank')->where('user_id', $user_id)->get();

        $accounts = $accounts->map(function ($a) {
            return [
                'id' => $a->id,
                'account_number' => $a->account_number,
                'account_type' => $a->account_type,
                'bank_id' => $a->bank->id,
                'bank_name' => $a->bank->name,
                'bank_logo' => $a->bank->logo_url,
                'owner_full_name' => $a->owner ? $a->owner->full_name : null,
                'owner_document' => $a->owner ? $a->owner->document_number : null,
                'owner_phone' => $a->owner ? $a->owner->phone : null,
            ];
        });

        return response()->json($accounts);
    }

    public function eliminarCuenta($id)
    {
        $account = Account::findOrFail($id);

        if ($account->account_type === 'destination' && $account->owner_id) {
            AccountOwner::where('id', $account->owner_id)->delete();
        }

        $account->delete();

        return response()->json(['message' => 'Cuenta eliminada correctamente']);
    }

  public function crearTransferencia(Request $request)
{
    // Usuario autenticado
    $user = $request->user();

    // Verificación KYC
    if ($user->kyc_status !== 'verified') {
        return response()->json([
            'message' => 'Debes completar la verificación KYC antes de crear una transferencia.'
        ], 403); 
    }

    // Validación
    $validated = $request->validate([
        'origin_account_id'       => ['required','exists:accounts,id'],
        'destination_account_id'  => ['required','exists:accounts,id','different:origin_account_id'],
        'amount'                  => ['required','numeric','min:0.01'],
        'exchange_rate'           => ['required','numeric','min:0.0001'],
        'converted_amount'        => ['nullable','numeric','min:0'],
        'comprobante'             => ['nullable','file','mimes:jpg,jpeg,png,pdf','max:5120'],
        'modo'                    => ['required','in:BOBtoPEN,PENtoBOB'],
    ]);

    $transfer = Transfer::create([
        'user_id'                => $user->id,
        'origin_account_id'      => $request->origin_account_id,
        'destination_account_id' => $request->destination_account_id,
        'amount'                 => $request->amount,
        'exchange_rate'          => $request->exchange_rate,
        'converted_amount'       => $request->converted_amount,
        'modo'                   => $request->modo,
        'status'                 => 'pending',
    ]);

    // Guardar comprobante
    $comprobantePath = null;
    if ($request->hasFile('comprobante')) {
        $comprobantePath = $request->file('comprobante')->store('comprobantes', 'public');
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

    // Determinar monedas y calcular monto convertido según modo
    $modo = $request->modo;

    if ($modo === 'BOBtoPEN') {
        $depositCurrency = 'BOB';
        $receiveCurrency = 'PEN';
        $convertedAmount = $request->filled('converted_amount')
            ? (float)$request->converted_amount
            : round($transfer->amount * $transfer->exchange_rate, 2);
    } else { // PENtoBOB
        $depositCurrency = 'PEN';
        $receiveCurrency = 'BOB';
        $convertedAmount = $request->filled('converted_amount')
            ? (float)$request->converted_amount
            : round($transfer->amount / $transfer->exchange_rate, 2);
    }

    // Payload común (para mails)
    $payload = [
        'transfer'        => $transfer,
        'transferNumber'  => $transferNumber,
        'depositCurrency' => $depositCurrency,
        'receiveCurrency' => $receiveCurrency,
        'convertedAmount' => $convertedAmount,
        'comprobantePath' => $comprobantePath,
    ];

    // Enviar mails
    Mail::to("operaciones@transfercash.click")->send(new \App\Mail\NuevaTransferenciaAdmin($payload));
    Mail::to($user->email)->send(new \App\Mail\NuevaTransferenciaUsuario($payload));

   // 🔔 Enviar mensaje ya armado a n8n (para Evolution API)
try {
    $mensaje = "📌 *Nueva transferencia registrada*\n\n".
               "📝 *Detalles de la operación*\n".
               "• Número de operación: {$transferNumber}\n".
               "• Fecha: {$transfer->created_at->format('d/m/Y H:i')}\n".
               "• Tipo de cambio aplicado: {$transfer->exchange_rate}\n\n".

               "💰 *Depósito recibido*\n".
               "• Monto recibido: ".number_format($transfer->amount, 2)." {$depositCurrency}\n".
               "• Banco origen: {$transfer->originAccount->bank->name}\n".
               "• Número de cuenta origen: {$transfer->originAccount->account_number}\n\n".

               "👤 *Propietario de la cuenta origen*\n".
               "• Nombre: {$user->first_name} {$user->last_name}\n".
               "• Email: {$user->email}\n".
               "• Teléfono: ".($user->phone ?? 'N/D')."\n".
               "• Nacionalidad: ".ucfirst($user->nationality ?? 'N/D')."\n".
               "• Documento: ".($user->document_number ?? 'N/D')."\n\n".

               "📤 *Monto a enviar*\n".
               "• Monto convertido: ".number_format($convertedAmount, 2)." {$receiveCurrency}\n".
               "• Banco destino: {$transfer->destinationAccount->bank->name}\n".
               "• Número de cuenta destino: {$transfer->destinationAccount->account_number}\n\n";

    if ($transfer->destinationAccount->owner) {
        $destOwner = $transfer->destinationAccount->owner;
        $mensaje .= "👤 *Titular de la cuenta destino*\n".
                    "• Nombre: ".($destOwner->full_name ?? 'N/D')."\n".
                    "• Documento: ".($destOwner->document_number ?? 'N/D')."\n".
                    "• Teléfono: ".($destOwner->phone ?? 'N/D')."\n".
                    "• Email: ".($destOwner->email ?? 'N/D')."\n\n";
    }

    $mensaje .= "📎 *Comprobante*: verificar en los Mails.\n\n".
                "🔗 Ir al panel de administración para mas detalles:\n".
                url('/admin/login');
 
    // Configuración Evolution API
    $server   = "https://prueba-evolution-api-lima.ylblfg.easypanel.host";
    $instance = "TransferCash";
    $apikey   = "822640AECF45-4D03-88B6-7AFD82BC61DA";

    // Payload correcto
    $whatsPayload = [
        'number' => '59174048209', // número admin
        'text'   => $mensaje,
    ];

    // Enviar directamente al servidor de Evolution API
    $response = Http::withHeaders([
        'Content-Type' => 'application/json',
        'apikey'       => $apikey,
    ])->post("$server/message/sendText/$instance", $whatsPayload);

    if ($response->failed()) {
        \Log::error("❌ Error enviando mensaje a Evolution API: ".$response->body());
    }
} catch (\Exception $e) {
    \Log::error("❌ Excepción enviando mensaje a Evolution API: ".$e->getMessage());
}


    return response()->json([
        'transfer'        => $transfer,
        'transfer_number' => $transferNumber,
    ]);
}
}
