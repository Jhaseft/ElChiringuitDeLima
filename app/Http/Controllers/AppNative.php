<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Mail\VerifyCodeEmail;

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

        // Generar código de 6 dígitos
        $code = rand(100000, 999999);

        // Guardar los datos + código en cache por 30 min
        Cache::put('register:' . $code, [
            'first_name'      => $request->first_name,
            'last_name'       => $request->last_name,
            'email'           => $request->email,
            'phone'           => $request->phone,
            'nationality'     => $request->nationality,
            'document_number' => $request->document_number,
            'accepted_terms_at'=> now(),
            'terms_version'    => '1.0',
            'password'        => Hash::make($request->password),
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
        $request->validate([
            'code' => 'required|numeric',
        ]);

        $data = Cache::get('register:' . $request->code);

        if (!$data) {
            return response()->json([
                'status' => 'error',
                'message' => 'Código inválido o expirado.',
            ], 400);
        }

        // Crear usuario
        $user = User::create($data);

        // Borrar de cache
        Cache::forget('register:' . $request->code);

        // Crear token para la app móvil
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
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('mobile-app')->plainTextToken;

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
}
