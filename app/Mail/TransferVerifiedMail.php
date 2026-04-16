<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TransferVerifiedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $transfer;
    public $adminReceipt; // ahora es URL, no archivo

    public function __construct($transfer, $adminReceipt = null)
    {
        $this->transfer = $transfer;
        $this->adminReceipt = $adminReceipt;
    }

    public function build()
    {
        $this->transfer->loadMissing([
            'paymentMethod',
            'originAccount.bank',
            'originAccount.owner',
            'destinationAccount.bank',
            'destinationAccount.owner',
        ]);

        $slug       = $this->transfer->paymentMethod?->slug ?? 'bank_transfer';
        $methodName = $this->transfer->paymentMethod?->name ?? 'Transferencia Bancaria';

        $modo            = $this->transfer->modo;
        $depositCurrency = $modo === 'BOBtoPEN' ? 'BOB' : 'PEN';
        $receiveCurrency = $modo === 'BOBtoPEN' ? 'PEN' : 'BOB';

        return $this->subject('Tu transferencia ha sido verificada')
                    ->view('emails.transfer_verified')
                    ->with([
                        'transfer'            => $this->transfer,
                        'amount'              => $this->transfer->amount,
                        'converted_amount'    => $this->transfer->converted_amount,
                        'origin_account'      => $this->transfer->originAccount,
                        'destination_account' => $this->transfer->destinationAccount,
                        'exchange_rate'       => $this->transfer->exchange_rate,
                        'adminReceipt'        => $this->adminReceipt,
                        'paymentMethodSlug'   => $slug,
                        'paymentMethodName'   => $methodName,
                        'depositCurrency'     => $depositCurrency,
                        'receiveCurrency'     => $receiveCurrency,
                    ]);
    }
}