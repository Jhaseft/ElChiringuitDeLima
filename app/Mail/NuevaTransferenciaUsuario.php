<?php

namespace App\Mail;
 
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NuevaTransferenciaUsuario extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data) { $this->data = $data; }

    public function build()
    {
        return $this->subject("Tu operación fue registrada: {$this->data['transferNumber']}")
                    ->replyTo('no-reply@transfercash.click', config('app.name').' (no responder)')
                    ->view('emails.transfer.usuario');
    }
}
