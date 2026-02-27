<?php

namespace App\Mail;
 
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NuevaTransferenciaAdmin extends Mailable
{
    use Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data) { $this->data = $data; }

    public function build(){

    return $this->subject("Nueva transferencia: {$this->data['transferNumber']}")
                ->markdown('emails.transfer.admin');
    }
}
