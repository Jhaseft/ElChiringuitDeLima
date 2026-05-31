<?php

namespace App\Jobs;

use App\Models\PushToken;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendExpoPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        private string $title,
        private string $body,
        private array $data = [],
        private ?string $userId = null
    ) {}

    public function handle(): void
    {
        $query = PushToken::query()->whereNotNull('token');

        if ($this->userId) {
            $query->where('user_id', $this->userId);
        }

        $query->orderBy('id')->chunk(100, function ($tokens) {
            $messages = $tokens->map(fn($t) => [
                'to'    => $t->token,
                'title' => $this->title,
                'body'  => $this->body,
                'data'  => $this->data,
                'sound' => 'default',
            ])->values()->toArray();

            try {
                $response = Http::withHeaders([
                    'Accept'       => 'application/json',
                    'Content-Type' => 'application/json',
                ])->post('https://exp.host/--/api/v2/push/send', $messages);

                if (!$response->ok()) {
                    Log::error('Expo push error', ['response' => $response->body()]);
                }
            } catch (\Exception $e) {
                Log::error('Expo push exception', ['error' => $e->getMessage()]);
                $this->fail($e);
            }
        });
    }
}
