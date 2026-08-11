<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\Account;
use App\Mail\VerifyCodeEmail;
use App\Http\Controllers\Controller;
use App\Models\PushToken;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Helpers\AppLog;
use Firebase\JWT\JWT;
use Firebase\JWT\JWK;

class AppNative extends Controller
{
    // Registro con código de verificación
    public function register(Request $request)
    {
        $request->validate([
            'first_name'       => 'required|string|max:255',
            'last_name'        => 'required|string|max:255',
            'email'            => 'required|string|email|max:255|unique:users,email',
            'phone'            => 'nullable|string|max:20|unique:users,phone',
            'nationality'      => 'nullable|string|max:100',
            'document_number'  => 'nullable|string|max:50|unique:users,document_number',
            'password'         => ['required', 'confirmed', 'digits:4'],
        ]);

        // Código aleatorio criptográficamente seguro (no usar rand()).
        $code = random_int(100000, 999999);

        // La cache se indexa por EMAIL, no por el código. Así el código no vive
        // en un espacio global adivinable: para probarlo hay que conocer el email
        // y aun así solo se permiten unos pocos intentos (ver verifyCode).
        Cache::put('register:' . $request->email, [
            'code'     => (string) $code,
            'attempts' => 0,
            'data'     => [
                'first_name'       => $request->first_name,
                'last_name'        => $request->last_name,
                'email'            => $request->email,
                'phone'            => $request->phone,
                'nationality'      => $request->nationality,
                'document_number'  => $request->document_number,
                'password'         => Hash::make($request->password),
            ],
        ], now()->addMinutes(30));
 
        try {
            Mail::to($request->email)->send(new VerifyCodeEmail($code));
            return response()->json([
                'status' => 'success',
                'message' => 'Código enviado al correo. Revisa tu bandeja e ingrésalo para activar tu cuenta.',
            ]);
        } catch (\Exception $e) {
            AppLog::error('Error enviando código de registro', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ], 'auth');
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo enviar el código. Inténtalo de nuevo.',
            ], 500);
        }
    }

    // Verificar código y crear usuario
    public function verifyCode(Request $request)
    {
        // Ahora se exige el email: el código está atado a él (ver register).
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|digits:6',
        ]);

        $key   = 'register:' . $request->email;
        $entry = Cache::get($key);

        if (!$entry) {
            return response()->json(['status' => 'error', 'message' => 'Código inválido o expirado.'], 400);
        }

        // Límite de intentos por registro: sin esto, un código de 6 dígitos es
        // fácil de forzar. Tras 5 fallos se invalida y hay que pedir uno nuevo.
        if (($entry['attempts'] ?? 0) >= 5) {
            Cache::forget($key);
            return response()->json(['status' => 'error', 'message' => 'Demasiados intentos. Solicita un nuevo código.'], 429);
        }

        // Comparación timing-safe del código.
        if (!hash_equals((string) $entry['code'], (string) $request->code)) {
            $entry['attempts'] = ($entry['attempts'] ?? 0) + 1;
            Cache::put($key, $entry, now()->addMinutes(30));
            return response()->json(['status' => 'error', 'message' => 'Código inválido o expirado.'], 400);
        }

        $user = User::create($entry['data']);
        Cache::forget($key);

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Cuenta verificada y creada correctamente.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // Bloqueo por intentos fallidos (email + IP), mismo mecanismo robusto
        // que el login web. Devuelve 429 con los segundos de espera.
        $limiter = app(\App\Services\AuthRateLimiter::class);
        $email   = (string) $request->input('email');

        if ($limiter->tooManyAttempts($request, $email)) {
            $seconds = $limiter->availableIn($request, $email);
            return response()->json([
                'message' => "Demasiados intentos de acceso. Intenta nuevamente en {$seconds} segundos.",
            ], 429);
        }

        if (!Auth::attempt($credentials)) {
            $limiter->hit($request, $email);
            AppLog::warning('Login fallido', ['email' => $request->email], 'auth');
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $limiter->clear($request, $email);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->tokens()->delete();
        $token = $user->createToken('mobile-app')->plainTextToken;
    

        // Cargar relaciones necesarias
        $user->load(['accounts', 'transfers', 'media']);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        PushToken::where('user_id', $request->user()->id)->delete();
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    // Obtener info del usuario
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    // Listar cuentas del usuario autenticado
    public function listarCuentas(Request $request)
{
    $method_type = $request->query('type');

    // El user_id SIEMPRE sale del token, nunca del query (evita IDOR:
    // leer las cuentas de otro usuario pasando su id).
    $userId = $request->user()?->id;

    if (!$userId) {
        return response()->json(['error' => 'Usuario no encontrado'], 404);
    }

    $accounts = Account::with(['bank', 'owner'])
        ->where('user_id', $userId)
        ->where('method_type', $method_type)
        ->where('desactivate',false)
        ->get();

    if ($method_type === 'bank') {
        $accounts = $accounts->map(function ($a) {
            return [
                'id' => $a->id,
                'account_number' => $a->account_number,
                'account_type' => $a->account_type,
                'bank_id' => $a->bank?->id,
                'bank_name' => $a->bank?->name,
                'bank_logo' => $a->bank?->logo_url,
                'bank_country' => $a->bank?->country,
                'owner_full_name' => $a->owner?->full_name,
                'owner_document' => $a->owner?->document_number,
                'owner_phone' => $a->owner?->phone,
            ];
        });

    } elseif ($method_type === 'qr') {
        $accounts = $accounts->map(function ($a) {
            return [
                'id' => $a->id,
                'qr_value' => $a->qr_value,
                'qr_country' => $a->qr_country,
            ]; 
        });
    } else {
        return response()->json([
            'error' => 'Método no válido'
        ], 400);
    }


    return response()->json($accounts);
}



// Completar perfil (usuarios Google o incompletos)
public function completeProfile(Request $request)
{
    $user = $request->user();

    $request->validate([
        'nationality'     => 'required|string|max:255',
        'phone'           => 'required|string|max:255|unique:users,phone,' . $user->id,
        'document_number' => 'required|string|max:255|unique:users,document_number,' . $user->id,
        'terms'           => 'required|accepted',
        'password'        => ['required', 'confirmed', 'digits:4'],
    ]);

    $user->update([
        'nationality'       => $request->nationality,
        'phone'             => $request->phone,
        'document_number'   => $request->document_number,
        'password'          => Hash::make($request->password),
    ]);

    //  Cargar relaciones como en login y Google
    $user->load(['accounts', 'transfers', 'media']);

    return response()->json([
        'status'  => 'success',
        'message' => 'Perfil completado correctamente.',
        'user'    => $user,
    ]);
}

public function loginGoogle(Request $request)
{
    $request->validate([
        'idToken' => 'required|string',
    ]);

    // Verificar token con Google
    $googleResponse = Http::get(
        'https://oauth2.googleapis.com/tokeninfo',
        ['id_token' => $request->idToken]
    );

    if (!$googleResponse->ok()) {
        AppLog::warning('Login Google fallido - token inválido', [], 'auth');
        return response()->json([
            'message' => 'Token inválido'
        ], 401);
    }

    $googleUser = $googleResponse->json();

    // Verificar que el token sea de TU app (fail-closed: si no hay client id
    // configurado, se rechaza en vez de dejar pasar sin validar).
    $expectedAud = config('services.google.Android_app_id');
    if (!$expectedAud || ($googleUser['aud'] ?? null) !== $expectedAud) {
        return response()->json([
            'message' => 'Token no válido para esta aplicación'
        ], 401);
    }

    // El correo de Google debe estar verificado: si no, cualquiera podría
    // crear una cuenta Google con el email de un tercero y tomar su cuenta.
    if (!filter_var($googleUser['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
        return response()->json([
            'message' => 'El correo de Google no está verificado'
        ], 401);
    }

    // Buscar usuario por email
    $user = User::where('email', $googleUser['email'])->first();

    // Si no existe, crear usuario
    if (!$user) {
        $user = User::create([
            'first_name'  => $googleUser['given_name'] ?? '',
            'last_name'   => $googleUser['family_name'] ?? '',
            'email'       => $googleUser['email'],
            'password'    => null,
        ]);
    }

    // Revocar sesiones anteriores (una sola sesión activa por usuario)
    $user->tokens()->delete();

    // Crear token Sanctum
    $token = $user->createToken('mobile-app')->plainTextToken;

    // Cargar relaciones si necesitas
    $user->load(['accounts', 'transfers', 'media']);

    // Revisar si el perfil está incompleto
    $needsProfile = empty($user->nationality) ||
                    empty($user->phone) ||
                    empty($user->document_number);

    return response()->json([
        'user' => $user,
        'token' => $token,
        'needs_profile' => $needsProfile // <-- si es true, app debe redirigir
    ]);
}

public function loginApple(Request $request)
{


    $request->validate([
        'identityToken' => 'required|string',
        'appleUserId'   => 'nullable|string',
        'email'         => 'nullable|email',
        'firstName'     => 'nullable|string|max:255',
        'lastName'      => 'nullable|string|max:255',
    ]);

    // Verificar la firma del identityToken contra las llaves públicas de Apple.
    try {
        // Apple rota sus llaves; las cacheamos 1 día.
        $keys = Cache::remember('apple_auth_keys', now()->addDay(), function () {
            $res = Http::get('https://appleid.apple.com/auth/keys');
            if (!$res->ok()) {
                throw new \Exception('No se pudieron obtener las llaves de Apple');
            }
            return $res->json();
        });

        $payload = JWT::decode($request->identityToken, JWK::parseKeySet($keys));

    } catch (\Throwable $e) {
        AppLog::warning('Login Apple fallido - token inválido', ['error' => $e->getMessage()], 'auth');
        return response()->json(['message' => 'Token inválido'], 401);
    }

    // Validar emisor y que el token sea para NUESTRA app (bundle id).
    if (($payload->iss ?? null) !== 'https://appleid.apple.com') {
        return response()->json(['message' => 'Emisor no válido'], 401);
    }

    // Fail-closed: si no hay bundle id configurado, se rechaza. Antes, con
    // $expectedAud null, el check se SALTABA y se aceptaban tokens de otras apps.
    $expectedAud = config('services.google.Apple_app_id');
    if (!$expectedAud || ($payload->aud ?? null) !== $expectedAud) {
        return response()->json(['message' => 'Token no válido para esta aplicación'], 401);
    }

    // El email viene dentro del token verificado (más confiable que el del request).
    $email = $payload->email ?? $request->email;
    if (!$email) {
        return response()->json(['message' => 'No se recibió el correo desde Apple'], 422);
    }

    // Buscar usuario por email.
    $user = User::where('email', $email)->first();

    // Si no existe, crearlo. Apple solo envía nombre/apellido en el PRIMER login.
    if (!$user) {
        $user = User::create([
            'first_name' => $request->firstName ?? '',
            'last_name'  => $request->lastName ?? '',
            'email'      => $email,
            'password'   => null,
        ]);
    }

    // Revocar sesiones anteriores (una sola sesión activa por usuario)
    $user->tokens()->delete();

    $token = $user->createToken('mobile-app')->plainTextToken;

    $user->load(['accounts', 'transfers', 'media']);

    $needsProfile = empty($user->nationality) ||
                    empty($user->phone) ||
                    empty($user->document_number);

    return response()->json([
        'user' => $user,
        'token' => $token,
        'needs_profile' => $needsProfile
    ]);
}


}
