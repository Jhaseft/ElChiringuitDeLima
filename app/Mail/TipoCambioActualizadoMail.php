<?php

namespace App\Mail;

use App\Models\TipoCambio;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TipoCambioActualizadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tipoCambio;

    public function __construct(TipoCambio $tipoCambio)
    {
        $this->tipoCambio = $tipoCambio;
    }

    public function build()
{
    return $this->subject('📢 Nuevo tipo de cambio - Transfer Cash')
                ->view('emails.tipo_cambio_actualizado') // usa la vista Blade
                ->with(['tipoCambio' => $this->tipoCambio]); // 👈 pasa la variable
}

}
