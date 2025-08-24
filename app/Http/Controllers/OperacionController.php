<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\AccountOwner;
use App\Models\Bank;
use App\Models\Transfer;
use Illuminate\Support\Facades\Mail;

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


   public function listarCuentas($user_id) {
    $accounts = Account::with('bank')->where('user_id', $user_id)->get();

$accounts = $accounts->map(function ($a) {
    return [
        'id' => $a->id,
        'account_number' => $a->account_number,
        'account_type' => $a->account_type,
        'bank_id' => $a->bank->id,
        'bank_name' => $a->bank->name,
        'bank_logo' => $a->bank->logo_url, // <- aquí obtienes el logo
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
        $validated = $request->validate([
            'user_id'                     => ['required','exists:users,id'],
            'origin_account_number'       => ['required','string','exists:accounts,account_number'],
            'destination_account_number'  => ['required','string','different:origin_account_number','exists:accounts,account_number'],
            'amount'                      => ['required','numeric','min:0.01'],    // monto depositado por el cliente
            'exchange_rate'               => ['required','numeric','min:0.0001'],  // tasa (t_cambio)
            'converted_amount'            => ['nullable','numeric','min:0'],       // monto a enviar en la otra moneda (opcional)
            'comprobante'                 => ['nullable','file','mimes:jpg,jpeg,png,pdf','max:5120'],
        ]);

        // Guardar transferencia
        $transfer = Transfer::create([
            'user_id'                    => $request->user_id,
            'origin_account_number'      => $request->origin_account_number,
            'destination_account_number' => $request->destination_account_number,
            'amount'                     => $request->amount,
            'exchange_rate'              => $request->exchange_rate,
            'status'                     => 'pending',
        ]);

        // Comprobante (opcional) -> se adjunta solo al admin
        $comprobantePath = null;
        if ($request->hasFile('comprobante')) {
            $comprobantePath = $request->file('comprobante')->store('comprobantes', 'public');
        }

        // Cargar relaciones (equivalente a JOIN)
        $transfer->load([
            'originAccount.bank',
            'originAccount.owner',
            'destinationAccount.bank',
            'destinationAccount.owner',
            'user',
        ]);

        // Número de operación tipo OP-00001
        $transferNumber = 'OP-' . str_pad($transfer->id, 5, '0', STR_PAD_LEFT);

        // Monedas según nacionalidad
        $nationality = strtolower($transfer->user->nationality ?? '');
        if ($nationality === 'boliviano') {
            $depositCurrency = 'BOB';
            $receiveCurrency = 'PEN';
        } elseif ($nationality === 'peruano') {
            $depositCurrency = 'PEN';
            $receiveCurrency = 'BOB';
        } else {
            // Fallback: BOB -> PEN
            $depositCurrency = 'BOB';
            $receiveCurrency = 'PEN';
        }

        // Monto a enviar (si no vino, lo calculamos como amount * tasa)
        $convertedAmount = $request->filled('converted_amount')
            ? (float)$request->converted_amount
            : round((float)$transfer->amount * (float)$transfer->exchange_rate, 2);

        // Datos compactados para los correos
        $payload = [
            'transfer'        => $transfer,
            'transferNumber'  => $transferNumber,
            'depositCurrency' => $depositCurrency,
            'receiveCurrency' => $receiveCurrency,
            'convertedAmount' => $convertedAmount,
            'comprobantePath' => $comprobantePath,
        ];

        // Correo al ADMIN (detallado, con comprobante adjunto)
        Mail::to("jhasesaat@gmail.com")
            ->send(new \App\Mail\NuevaTransferenciaAdmin($payload));

        // Correo al USUARIO (resumen)
        Mail::to($transfer->user->email)
            ->send(new \App\Mail\NuevaTransferenciaUsuario($payload));

        return response()->json([
            'transfer'        => $transfer,
            'transfer_number' => $transferNumber,
        ]);
    }

}
