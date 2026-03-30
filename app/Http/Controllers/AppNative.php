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
use Illuminate\Support\Facades\Http;

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
            'password'         => ['required', 'confirmed'],
        ]);

        $code = rand(100000, 999999);

        Cache::put('register:' . $code, [
            'first_name'       => $request->first_name,
            'last_name'        => $request->last_name,
            'email'            => $request->email,
            'phone'            => $request->phone,
            'nationality'      => $request->nationality,
            'document_number'  => $request->document_number,
            'password'         => Hash::make($request->password),
        ], now()->addMinutes(30));
 
        try {
            Mail::to($request->email)->send(new VerifyCodeEmail($code));
            return response()->json([
                'status' => 'success',
                'message' => 'Código enviado al correo. Revisa tu bandeja e ingrésalo para activar tu cuenta.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo enviar el código. Inténtalo de nuevo.',
            ], 500);
        }
    }

    // Verificar código y crear usuario
    public function verifyCode(Request $request)
    {
        $request->validate(['code' => 'required|numeric']);

        $data = Cache::get('register:' . $request->code);
        if (!$data) {
            return response()->json(['status' => 'error', 'message' => 'Código inválido o expirado.'], 400);
        }

        $user = User::create($data);
        Cache::forget('register:' . $request->code);

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

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $user = Auth::user();
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
    $userId = $request->query('user_id'); // obtener user_id desde la query

    // Si no viene user_id, usamos el usuario autenticado (opcional)
    if (!$userId) {
        $user = $request->user();
        $userId = $user?->id;
    }

    if (!$userId) {
        return response()->json(['error' => 'Usuario no encontrado'], 404);
    }

    $accounts = Account::with('bank', 'owner')
        ->where('user_id', $userId)
        ->get()
        ->map(function ($a) {
            return [
                'id' => $a->id,
                'account_number' => $a->account_number,
                'account_type' => $a->account_type,
                'bank_id' => $a->bank->id,
                'bank_name' => $a->bank->name,
                'bank_logo' => $a->bank->logo_url,
                'bank_country' => $a->bank->country,
                'owner_full_name' => $a->owner?->full_name,
                'owner_document' => $a->owner?->document_number,
                'owner_phone' => $a->owner?->phone,
            ];
        });

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
        'password'        => ['required', 'confirmed', 'min:8'],
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
        return response()->json([
            'message' => 'Token inválido'
        ], 401);
    }

    $googleUser = $googleResponse->json();

    // Verificar que el token sea de TU app
    if ($googleUser['aud'] !== env('GOOGLE_CLIENT_ID_APP')) {
        return response()->json([
            'message' => 'Token no válido para esta aplicación'
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


}
