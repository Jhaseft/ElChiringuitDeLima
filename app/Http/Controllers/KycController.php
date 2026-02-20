<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class KycController extends Controller
{
    public function createSession(Request $request)
    {
        Log::info("🔵 [KYC] Inicio createSession");

        $user = Auth::user();

        if (!$user) {
            Log::warning("🔴 [KYC] Usuario no autenticado");
            return response()->json(['error' => 'No autenticado'], 401);
        }

        Log::info("🟢 [KYC] Usuario autenticado", [
            'user_id' => $user->id,
            'email' => $user->email ?? null
        ]);
         Log::info("📤 [KYC] Enviando url", [
            'url' => url('/api/kyc/webhook')
        ]);
        $payload = [
            'webhook_url' => url('/api/kyc/webhook'),
            'next_url' => $request->input('next_url'),
        ];

        Log::info("📤 [KYC] Enviando request a KYC API", [
            'url' => 'https://kyc.aroon.tech/api/kyc/session',
            'payload' => $payload
        ]);

        try {
            $response = Http::withHeaders([
                'X-API-KEY' => 'sk_test_123456',
                'Content-Type' => 'application/json',
            ])->post('https://kyc.aroon.tech/api/kyc/session', $payload);

            Log::info("📥 [KYC] Respuesta HTTP", [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            $data = $response->json();

            Log::info("📦 [KYC] Response JSON parseado", [
                'data' => $data
            ]);

            if (!isset($data['session_id'])) {
                Log::error("❌ [KYC] session_id no encontrado", [
                    'response' => $data
                ]);

                return response()->json([
                    'error' => 'Respuesta inválida del servicio KYC',
                    'response' => $data
                ], 500);
            }

            // guardar en DB
            $user->kyc_session_id = $data['session_id'];
            $user->kyc_status = 'pending';
            $user->save();
 
            Log::info("💾 [KYC] Sesión guardada", [
                'user_id' => $user->id,
                'session_id' => $data['session_id']
            ]);

            return response()->json($data);

        } catch (\Exception $e) {
            Log::error("🔥 [KYC] Error creando sesión", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error conectando con servicio KYC'
            ], 500);
        }
    }

    public function webhook(Request $request)
{
    \Log::info("📥 [KYC WEBHOOK] recibido", $request->all());

    $sessionId = $request->input('session_id');
    $status    = $request->input('status');

    if (!$sessionId) {
        \Log::error("❌ [KYC WEBHOOK] session_id faltante");
        return response()->json(['error' => 'session_id requerido'], 400);
    }

    $user = \App\Models\User::where('kyc_session_id', $sessionId)->first();

    if (!$user) {
        \Log::error("❌ [KYC WEBHOOK] usuario no encontrado", [
            'session_id' => $sessionId
        ]);
        return response()->json(['error' => 'Usuario no encontrado'], 404);
    }

    \Log::info("🟢 [KYC WEBHOOK] usuario encontrado", [
        'user_id' => $user->id
    ]);

    //  ACTUALIZAR ESTADO
    if ($status === 'approved') {
        $user->kyc_status = 'verified';
    } else {
        $user->kyc_status = 'rejected';
    }

    $user->save();

    \Log::info("💾 [KYC WEBHOOK] estado actualizado", [
        'user_id' => $user->id,
        'status' => $user->kyc_status
    ]);

    return response()->json(['ok' => true]);
}
}