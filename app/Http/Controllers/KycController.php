<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KycController extends Controller
{
    public function createSession(Request $request)
{
    $user = Auth::user();

    if (!$user) {
        return response()->json(['error' => 'No autenticado'], 401);
    }

    $payload = [
        'webhook_url' => url('/api/kyc/webhook'),
        'next_url' => $request->input('next_url'),
    ];

    try {
        $response = Http::withHeaders([
            'X-API-KEY' => config('services.kyc.key'),
            'Content-Type' => 'application/json',
        ])->post(
            config('services.kyc.url') . '/api/kyc/session',
            $payload
        );

        $data = $response->json();

        if (!isset($data['session_id'])) {
            return response()->json([
                'error' => 'Respuesta inválida del servicio KYC',
                'response' => $data
            ], 500);
        }

        $user->kyc_session_id = $data['session_id'];
        $user->kyc_status = 'pending';
        $user->save();

        return response()->json($data);

    } catch (\Exception $e) {
        Log::error("🔥 [KYC] Error creando sesión", [
            'message' => $e->getMessage()
        ]);

        return response()->json([
            'error' => 'Error conectando con servicio KYC'
        ], 500);
    }
}
 
    public function webhook(Request $request)
    {

    $sessionId = $request->input('session_id');
    $status    = $request->input('status');

    if (!$sessionId) {
        return response()->json(['error' => 'session_id requerido'], 400);
    }

    $user = \App\Models\User::where('kyc_session_id', $sessionId)->first();

    if (!$user) {
        return response()->json(['error' => 'Usuario no encontrado'], 404);
    }

    //  ACTUALIZAR ESTADO
    if ($status === 'approved') {
        $user->kyc_status = 'verified';
    } else {
        $user->kyc_status = 'rejected';
    }

    $user->save();

    return response()->json(['ok' => true]);

    }
}