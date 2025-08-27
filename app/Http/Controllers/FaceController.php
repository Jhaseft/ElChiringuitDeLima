<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FaceController extends Controller
{
    // Vista React
    public function index(Request $request)
    {
        return Inertia::render('Face/FaceKycSteps', [
            'next' => $request->query('next', null)
        ]);
    }

    // Procesar resultado de la API KYC
    public function verify(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $resultado = $request->input('resultado');
        if (!is_array($resultado)) {
            return response()->json(['error' => 'Formato inválido'], 422);
        }

        // ✅ Aquí usamos la clave correcta que envía la API
        $verificado = data_get($resultado, 'verificado', false);
        $similitud = data_get($resultado, 'similitud_promedio', 0);
        $liveness  = data_get($resultado, 'liveness_movimiento', 0);
        $rostro    = data_get($resultado, 'rostro_detectado', false);

        $mensajes = [];

        // Solo dar sugerencias si la verificación automática no pasó
        if (!$verificado) {
            if ($similitud < 80) {
                $mensajes[] = "Tu rostro no coincide bien con tu documento. Asegúrate de buena iluminación y que la foto del documento esté clara.";
            }
            if ($liveness < 50) {
                $mensajes[] = "Necesitamos confirmar que eres real. Parpadea y mueve la cabeza al grabar el video.";
            }
            if (!$rostro) {
                $mensajes[] = "No se detectó tu rostro. Colócate frente a la cámara dentro del recuadro.";
            }
            if (empty($mensajes)) {
                $mensajes[] = "La verificación automática no pasó. Intenta nuevamente en un lugar iluminado.";
            }
        }

        // Estado final
        $aprobado = $verificado && empty($mensajes);

        // ✅ Guardamos solo valores permitidos para la constraint
        $user->kyc_status = $aprobado ? 'verified' : 'rejected';
        $user->save();

        return response()->json([
            'status'      => $aprobado ? 'success' : 'error',
            'titulo'      => $aprobado ? '✅ Verificación aprobada' : '⚠️ Verificación incompleta',
            'mensaje'     => $aprobado
                ? 'Tu identidad ha sido verificada exitosamente.'
                : 'No pudimos validar tu identidad. Revisa estas sugerencias:',
            'sugerencias' => $mensajes,
            'score'       => data_get($resultado, 'score', null),
        ]);
    }
}
