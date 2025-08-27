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
    // 1️⃣ Obtener el usuario autenticado (más seguro que recibir user_id del frontend)
    $user = $request->user();

    // 2️⃣ Seguridad extra: revisar KYC
    if ($user->kyc_status !== 'verified') {
        return response()->json([
            'message' => 'Debes completar la verificación KYC antes de crear una transferencia.'
        ], 403); // 403 = Forbidden
    }

    // 3️⃣ Validar campos (ya no pedimos user_id porque viene del auth)
    $validated = $request->validate([
        'origin_account_number'       => ['required','string','exists:accounts,account_number'],
        'destination_account_number'  => ['required','string','different:origin_account_number','exists:accounts,account_number'],
        'amount'                      => ['required','numeric','min:0.01'],
        'exchange_rate'               => ['required','numeric','min:0.0001'],
        'converted_amount'            => ['nullable','numeric','min:0'],
        'comprobante'                 => ['nullable','file','mimes:jpg,jpeg,png,pdf','max:5120'],
    ]);

    // 4️⃣ Guardar transferencia
    $transfer = Transfer::create([
        'user_id'                    => $user->id, // ✅ se asegura que sea del usuario autenticado
        'origin_account_number'      => $request->origin_account_number,
        'destination_account_number' => $request->destination_account_number,
        'amount'                     => $request->amount,
        'exchange_rate'              => $request->exchange_rate,
        'status'                     => 'pending',
    ]);

    // 5️⃣ Comprobante (opcional)
    $comprobantePath = null;
    if ($request->hasFile('comprobante')) {
        $comprobantePath = $request->file('comprobante')->store('comprobantes', 'public');
    }

    // 6️⃣ Cargar relaciones
    $transfer->load([
        'originAccount.bank',
        'originAccount.owner',
        'destinationAccount.bank',
        'destinationAccount.owner',
        'user',
    ]);

    // 7️⃣ Número de operación tipo OP-00001
    $transferNumber = 'OP-' . str_pad($transfer->id, 5, '0', STR_PAD_LEFT);

    // 8️⃣ Monedas según nacionalidad
    $nationality = strtolower($user->nationality ?? '');
    if ($nationality === 'boliviano') {
        $depositCurrency = 'BOB';
        $receiveCurrency = 'PEN';
    } elseif ($nationality === 'peruano') {
        $depositCurrency = 'PEN';
        $receiveCurrency = 'BOB';
    } else {
        $depositCurrency = 'BOB';
        $receiveCurrency = 'PEN';
    }

    // 9️⃣ Calcular monto convertido
    $convertedAmount = $request->filled('converted_amount')
        ? (float)$request->converted_amount
        : round((float)$transfer->amount * (float)$transfer->exchange_rate, 2);

    // 🔟 Datos compactados para mails
    $payload = [
        'transfer'        => $transfer,
        'transferNumber'  => $transferNumber,
        'depositCurrency' => $depositCurrency,
        'receiveCurrency' => $receiveCurrency,
        'convertedAmount' => $convertedAmount,
        'comprobantePath' => $comprobantePath,
    ];

    // 1️⃣1️⃣ Notificación a ADMIN
    Mail::to("jhasesaat@gmail.com")
        ->send(new \App\Mail\NuevaTransferenciaAdmin($payload));

    // 1️⃣2️⃣ Notificación al USUARIO
    Mail::to($user->email)
        ->send(new \App\Mail\NuevaTransferenciaUsuario($payload));

    return response()->json([
        'transfer'        => $transfer,
        'transfer_number' => $transferNumber,
    ]);
}


}
