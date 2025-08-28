<?php

namespace App\Jobs;

use App\Mail\ExchangeRateUpdatedMail;
use App\Models\ExchangeRate;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendExchangeRateEmailBatch implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public ExchangeRate $rate) {}

    public function handle(): void
    {
        // Envía emails en lotes (200 por chunk)
        User::query()
            ->whereNotNull('email')
            ->orderBy('id')
            ->chunk(200, function ($users) {
                foreach ($users as $user) {
                    Mail::to($user->email)->queue(new ExchangeRateUpdatedMail($this->rate));
                }
            });
    }
}
