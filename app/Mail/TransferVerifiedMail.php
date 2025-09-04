<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Transfer;

class TransferVerifiedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $transfer;
    public $comprobante;

    public function __construct($transfer, $comprobante = null)
    {
        $this->transfer = $transfer;
        $this->comprobante = $comprobante;
    }

    public function build()
    {
        $mail = $this->subject('Tu transferencia ha sido verificada')
                     ->view('emails.transfer_verified')
                     ->with([
                        'transfer' => $this->transfer,
                        'amount' => $this->transfer->amount,
                        'converted_amount' => $this->transfer->converted_amount,
                        'origin_account' => $this->transfer->originAccount,
                        'destination_account' => $this->transfer->destinationAccount,
                        'exchange_rate' => $this->transfer->exchange_rate,
                     ]);

        // Adjuntar comprobante si existe
        if ($this->comprobante) {
            $mail->attach($this->comprobante->getRealPath(), [
                'as' => $this->comprobante->getClientOriginalName(),
                'mime' => $this->comprobante->getMimeType(),
            ]);
        }

        return $mail;
    }
}
