<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Cloudinary\Api\Upload\UploadApi;
use App\Models\UserMedia;

class FaceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user && $user->kyc_status === 'verified') {
            return redirect()->route('welcome');
        }

        return Inertia::render('Face/FaceKycSteps', [
            'next' => $request->query('next', null)
        ]);
    }

public function verify(Request $request)
{
    $user = Auth::user();
    if (!$user) {
        return response()->json(['error' => 'No autenticado'], 401);
    }

    // Decodificar JSON de resultado
    $resultado = json_decode($request->input('resultado'), true);
    if (!is_array($resultado)) {
        return response()->json(['error' => 'Formato inválido'], 422);
    }

    $docType   = $request->input('doc_type'); // pasaporte, ci, licencia
    $verificado = data_get($resultado, 'verificado', false);
    $similitud  = data_get($resultado, 'similitud_promedio', 0);
    $liveness   = data_get($resultado, 'liveness_movimiento', 0);
    $rostro     = data_get($resultado, 'rostro_detectado', false);

    $mensajes = [];

    // 🔹 Validación mínima
    if ($similitud < 50) {
        $mensajes[] = "Rostro no coincide (Similitud baja).";
    }
    if ($liveness < 40) {
        $mensajes[] = "Necesitamos confirmar que eres real (Liveness insuficiente).";
    }
    if (!$rostro) {
        $mensajes[] = "No se detectó rostro.";
    }

    $aprobado = $verificado && empty($mensajes);

    // Guardar estado en el usuario
    $user->kyc_status = $aprobado ? 'verified' : 'rejected';
    $user->save();

    // Subir archivos a Cloudinary si fue aprobado
    if ($aprobado) {
        $uploadApi = new UploadApi();
        $folder = "users/{$user->id}";

        // 🔹 Definir qué campos subir
        $files = ['video' => 3]; // siempre hay video

        if ($docType === 'pasaporte') {
            $files['docFront'] = 1; // solo frente
        } elseif (in_array($docType, ['ci', 'licencia'])) {
            $files['docFront'] = 1;
            $files['docBack']  = 2;
        }

        foreach ($files as $field => $position) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);

                $options = ['folder' => $folder];
                if ($field === 'video') {
                    $options['resource_type'] = 'auto';
                }

                try {
                    $uploaded = $uploadApi->upload($file->getRealPath(), $options);

                    UserMedia::updateOrCreate(
                        [
                            'user_id'  => $user->id,
                            'position' => $position,
                        ],
                        [
                            'media_type' => $field === 'video' ? 'video' : 'image',
                            'url'        => $uploaded['secure_url'],
                            'public_id'  => $uploaded['public_id'],
                            'format'     => $uploaded['format'] ?? null,
                        ]
                    );
                } catch (\Exception $e) {
                    \Log::error("❌ Error subiendo $field a Cloudinary: " . $e->getMessage());
                }
            } else {
                \Log::warning("⚠️ Campo $field no recibido en la request.");
            }
        }
    }

    return response()->json([
        'status'      => $aprobado ? 'success' : 'error',
        'titulo'      => $aprobado ? '✅ Verificación aprobada' : '⚠️ Verificación incompleta',
        'mensaje'     => $aprobado ? 'Identidad verificada' : 'No pudimos validar tu identidad',
        'sugerencias' => $mensajes,
        'score'       => data_get($resultado, 'score', null),
    ]);
}

}
