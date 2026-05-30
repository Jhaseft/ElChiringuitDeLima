<?php

namespace App\Services;

use App\Models\PushToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    private const EXPO_URL = 'https://exp.host/--/api/v2/push/send';

    public function sendToUser(string $userId, string $title, string $body, array $data = []): void
    {
        $tokens = PushToken::where('user_id', $userId)->pluck('token')->toArray();

        if (empty($tokens)) return;

        $this->send($tokens, $title, $body, $data);
    }

    public function sendToAll(string $title, string $body, array $data = []): void
    {
        $tokens = PushToken::whereNotNull('user_id')->pluck('token')->toArray();

        if (empty($tokens)) return;

        $this->send($tokens, $title, $body, $data);
    }

    private function send(array $tokens, string $title, string $body, array $data = []): void
    {
        $messages = array_map(fn($token) => [
            'to'    => $token,
            'title' => $title,
            'body'  => $body,
            'data'  => $data,
            'sound' => 'default',
        ], $tokens);

        // Expo acepta hasta 100 mensajes por request
        foreach (array_chunk($messages, 100) as $chunk) {
            try {
                $response = Http::withHeaders([
                    'Accept'       => 'application/json',
                    'Content-Type' => 'application/json',
                ])->post(self::EXPO_URL, $chunk);

                if (!$response->ok()) {
                    Log::error('Expo push error', ['response' => $response->body()]);
                }
            } catch (\Exception $e) {
                Log::error('Expo push exception', ['error' => $e->getMessage()]);
            }
        }
    }
}
