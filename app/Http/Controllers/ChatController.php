<?php

namespace App\Http\Controllers;

use App\Models\TipoCambio;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{

    public function send(Request $request)
    {
        $data = $request->validate([
            'message'    => 'required|string|max:2000',
            'session_id' => 'required|string|max:100',
        ]);

        $webhook = config('services.n8n.chat_webhook');

        if (!$webhook) {
            return response()->json([
                'reply' => 'El asistente no está configurado correctamente.',
            ], 503);
        }
 
        $user = Auth::user();
 
        $payload = [
            'message'        => $data['message'],
            'session_id'     => $data['session_id'],
            'user_id'        => $user?->id,
            'user_name'      => $user?->first_name,
            'user_email'     => $user?->email,
            'is_authenticated' => (bool) $user,
        ];

        Log::info('[Chat] incoming request', [
            'session_id'     => $data['session_id'],
            'message'        => $data['message'],
            'message_length' => strlen($data['message']),
            'user_id'        => $user?->id,
            'webhook'        => $webhook,
        ]);

        try {
            $startedAt = microtime(true);

            $response = Http::timeout(30)
                ->acceptJson()
                ->asJson()
                ->post($webhook, $payload);

            $elapsedMs = (int) ((microtime(true) - $startedAt) * 1000);

            Log::info('[Chat] n8n response received', [
                'status'      => $response->status(),
                'elapsed_ms'  => $elapsedMs,
                'headers'     => $response->headers(),
                'raw_body'    => $response->body(),
            ]);

            if (!$response->successful()) {
                Log::warning('[Chat] n8n webhook returned non-2xx', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);

                return response()->json([
                    'reply' => 'No pude conectarme con el asistente. Intenta más tarde.',
                ], 502);
            }

            $body = $response->json();

            Log::info('[Chat] decoded body', [
                'type'    => gettype($body),
                'is_list' => is_array($body) ? array_is_list($body) : false,
                'keys'    => is_array($body) ? array_keys($body) : null,
                'body'    => $body,
            ]);

            if (is_array($body) && array_is_list($body) && !empty($body)) {
                $body = $body[0];
                Log::info('[Chat] unwrapped first array element', ['body' => $body]);
            }

            $reply = data_get($body, 'reply')
                ?? data_get($body, 'output')
                ?? data_get($body, 'text')
                ?? data_get($body, 'message')
                ?? data_get($body, 'json.reply')
                ?? data_get($body, 'json.output')
                ?? (is_string($body) ? $body : null)
                ?? 'No obtuve una respuesta válida del asistente.';

            if (!is_string($reply)) {
                Log::warning('[Chat] reply is not a string after parsing', [
                    'reply_type' => gettype($reply),
                    'reply_raw'  => $reply,
                    'body'       => $response->body(),
                ]);
                $reply = 'No obtuve una respuesta válida del asistente.';
            }

            Log::info('[Chat] final reply sent to client', [
                'session_id'   => $data['session_id'],
                'reply_length' => strlen($reply),
                'reply'        => $reply,
            ]);

            return response()->json(['reply' => $reply]);
        } catch (\Throwable $e) {
            Log::error('[Chat] exception while calling n8n', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'reply' => 'Hubo un error al procesar tu mensaje.',
            ], 500);
        }
    }
}
