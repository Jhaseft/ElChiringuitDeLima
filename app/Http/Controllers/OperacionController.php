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

        // Payload para mails
        $payload = [
            'transfer'        => $transfer,
            'transferNumber'  => $transferNumber,
            'depositCurrency' => $depositCurrency,
            'receiveCurrency' => $receiveCurrency,
            'convertedAmount' => $convertedAmount,
            'comprobantePath' => $comprobantePath,
        ];

        // Enviar mails
        Mail::to("jhasesaat@gmail.com")->send(new \App\Mail\NuevaTransferenciaAdmin($payload));
        Mail::to($user->email)->send(new \App\Mail\NuevaTransferenciaUsuario($payload));

        return response()->json([
            'transfer'        => $transfer,
            'transfer_number' => $transferNumber,
        ]);
    }
}
