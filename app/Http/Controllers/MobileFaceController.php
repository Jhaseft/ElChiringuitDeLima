<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Cloudinary\Api\Upload\UploadApi;
use App\Models\UserMedia;

class MobileFaceController extends Controller
{
    // Obtener URL de KYC para WebView
    public function getKycUrl(Request $request)
    {
        $user = $request->user();

        if ($user->kyc_status === 'verified') {
            return response()->json([
                'status' => 'verified',
                'message' => 'Usuario ya verificado',
            ]);
        }

        $kycUrl = url('/mobile-face') . '?next=app://kyc-success';
        return response()->json([
            'status' => 'pending',
            'kyc_url' => $kycUrl,
        ]);
    }

    // Verificar KYC desde mobile
    public function verify(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $resultado = json_decode($request->input('resultado'), true);
        if (!is_array($resultado)) {
            return response()->json(['error' => 'Formato inválido'], 422);
        }

        $docType   = $request->input('doc_type'); 
        $verificado = data_get($resultado, 'verificado', false);
        $similitud  = data_get($resultado, 'similitud_promedio', 0);
        $liveness   = data_get($resultado, 'liveness_movimiento', 0);
        $rostro     = data_get($resultado, 'rostro_detectado', false);

        $mensajes = [];
        if ($similitud < 40) $mensajes[] = "Rostro no coincide (Similitud baja).";
        if ($liveness < 30) $mensajes[] = "Necesitamos confirmar que eres real (Liveness insuficiente).";
        if (!$rostro) $mensajes[] = "No se detectó rostro.";

        $aprobado = $verificado && empty($mensajes);

        if (!$aprobado) {
            $user->kyc_status = 'rejected';
            $user->save();

            return response()->json([
                'status' => 'error',
                'titulo' => '⚠️ Verificación incompleta',
                'mensaje' => 'No pudimos validar tu identidad',
                'sugerencias' => $mensajes,
            ]);
        }

        // Subir archivos a Cloudinary
        $uploadApi = new UploadApi();
        $folder = "users/{$user->id}";
        $files = ['video' => 3];
        if ($docType === 'pasaporte') $files['docFront'] = 1;
        if (in_array($docType, ['ci','licencia'])) {
            $files['docFront'] = 1;
            $files['docBack']  = 2;
        }

        $allUploaded = true;
        foreach ($files as $field => $position) {
            if ($request->hasFile($field)) {
                $file = $request->file($field);
                $options = ['folder' => $folder];
                if ($field === 'video') $options['resource_type'] = 'auto';
                try {
                    $uploaded = $uploadApi->upload($file->getRealPath(), $options);
                    UserMedia::updateOrCreate(
                        ['user_id' => $user->id, 'position' => $position],
                        [
                            'media_type' => $field === 'video' ? 'video' : 'image',
                            'url' => $uploaded['secure_url'],
                            'public_id' => $uploaded['public_id'],
                            'format' => $uploaded['format'] ?? null,
                        ]
                    );
                } catch (\Exception $e) {
                    \Log::error("Error subiendo $field: ".$e->getMessage());
                    $allUploaded = false;
                }
            } else {
                $allUploaded = false;
            }
        }

        if (!$allUploaded) {
            $user->kyc_status = 'rejected';
            $user->save();
            return response()->json([
                'status' => 'error',
                'titulo' => '⚠️ Verificación incompleta',
                'mensaje' => 'No se pudieron subir todos los archivos',
                'sugerencias' => $mensajes,
            ]);
        }

        $user->kyc_status = 'verified';
        $user->save();

        return response()->json([
            'status' => 'success',
            'titulo' => '✅ Verificación aprobada',
            'mensaje' => 'Identidad verificada',
            'sugerencias' => $mensajes,
        ]);
    }
}
