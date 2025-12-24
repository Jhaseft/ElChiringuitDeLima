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

    //  Validación mínima
    if ($similitud < 35) {
        $mensajes[] = "Rostro no coincide (Similitud baja).";
    }
    if ($liveness < 30) {
        $mensajes[] = "Necesitamos confirmar que eres real (Liveness insuficiente sube otro video).";
    }
    if (!$rostro) {
        $mensajes[] = "No se detectó rostro.";
    }

    $aprobado = $verificado && empty($mensajes);

    // Si no pasó la verificación KYC básica, no continuar
    if (!$aprobado) {
        $user->kyc_status = 'rejected';
        $user->save();

        return response()->json([
            'status'      => 'error',
            'titulo'      => '⚠️ Verificación incompleta',
            'mensaje'     => 'No pudimos validar tu identidad',
            'sugerencias' => $mensajes,
            'score'       => data_get($resultado, 'score', null),
        ]);
    }

    // 🔹 Subir archivos a Cloudinary
    $uploadApi = new UploadApi();
    $folder = "users/{$user->id}";

    $files = ['video' => 3]; // siempre hay video
    if ($docType === 'pasaporte') {
        $files['docFront'] = 1;
    } elseif (in_array($docType, ['ci', 'licencia'])) {
        $files['docFront'] = 1;
        $files['docBack']  = 2;
    }

    $allUploaded = true; // bandera para verificar si todo subió correctamente

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
                $allUploaded = false;
            }
        } else {
            \Log::warning("⚠️ Campo $field no recibido en la request.");
            $allUploaded = false;
        }
    }

    // Si alguna subida falló, marcar como rechazado
    if (!$allUploaded) {
        $user->kyc_status = 'rejected';
        $user->save();

        return response()->json([
            'status'      => 'error',
            'titulo'      => '⚠️ Verificación incompleta',
            'mensaje'     => 'No pudimos subir todos los archivos a Cloudinary',
            'sugerencias' => $mensajes,
            'score'       => data_get($resultado, 'score', null),
        ]);
    }

    // Todo bien, marcar como verificado
    $user->kyc_status = 'verified';
    $user->save();

    return response()->json([
        'status'      => 'success',
        'titulo'      => ' Verificación aprobada',
        'mensaje'     => 'Identidad verificada',
        'sugerencias' => $mensajes,
        'score'       => data_get($resultado, 'score', null),
    ]);
}


}
