<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Cloudinary\Api\Upload\UploadApi;
use App\Models\UserMedia;
use Inertia\Inertia;

class MobileFaceController extends Controller
{
    public function viewMobileKyc(Request $request)
    {
        $token = $request->query('token');
        if (!$token) return redirect('/login');

        try {
            $user = auth()->guard('api')->userFromToken($token); // tu método de JWT/Passport/Sanctum
        } catch (\Exception $e) {
            return redirect('/login');
        }

        if (!$user) return redirect('/login');

        return Inertia::render('Face/FaceKycStepsMobile', [
            'next' => $request->query('next', 'app://kyc-success'),
            'user' => $user,
        ]);
    }

    public function verify(Request $request)
    {
        // 1️⃣ Obtener usuario directamente desde token
        $token = $request->input('token');
        if (!$token) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        try {
            $user = auth()->guard('api')->userFromToken($token);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 401);
        }

        // 2️⃣ Procesar resultado KYC
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
                'status'      => 'error',
                'titulo'      => '⚠️ Verificación incompleta',
                'mensaje'     => 'No pudimos validar tu identidad',
                'sugerencias' => $mensajes,
            ]);
        }

        // 3️⃣ Subir archivos a Cloudinary
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
                'status'      => 'error',
                'titulo'      => '⚠️ Verificación incompleta',
                'mensaje'     => 'No se pudieron subir todos los archivos',
                'sugerencias' => $mensajes,
            ]);
        }

        $user->kyc_status = 'verified';
        $user->save();

        return response()->json([
            'status'      => 'success',
            'titulo'      => '✅ Verificación aprobada',
            'mensaje'     => 'Identidad verificada',
            'sugerencias' => $mensajes,
        ]);
    }
}
