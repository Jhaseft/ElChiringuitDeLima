<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CanjeInstruccionesMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $nombreProducto,
        public float $puntosUsados,
        public ?string $instrucciones = null,
        public ?string $imagenUrl = null,
    ) {}

    public function build()
    {
        return $this->subject('Confirmación de canje: '.$this->nombreProducto)
                    ->replyTo('no-reply@transfercash.click', config('app.name').' (no responder)')
                    ->view('emails.canje_instrucciones')
                    ->with([
                        'nombreProducto' => $this->nombreProducto,
                        'puntosUsados'   => $this->puntosUsados,
                        'instrucciones'  => $this->instrucciones,
                        'imagenUrl'      => $this->imagenUrl,
                    ]);
    }
}
