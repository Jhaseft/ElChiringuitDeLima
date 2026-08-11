<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyCodeEmail;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    // Paso 1: valida los datos y envía un código de 6 dígitos al correo.
    // (Mismo mecanismo que la app móvil: sin enlaces, solo código.)
    public function store(Request $request)
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

        // Código aleatorio criptográficamente seguro.
        $code = random_int(100000, 999999);

        // Se indexa por EMAIL (no por el código): el código no vive en un espacio
        // global adivinable y se limitan los intentos al verificar.
        Cache::put('register:' . $request->email, [
            'code'     => (string) $code,
            'attempts' => 0,
            'data'     => [
                'first_name'      => $request->first_name,
                'last_name'       => $request->last_name,
                'email'           => $request->email,
                'phone'           => $request->phone,
                'nationality'     => $request->nationality,
                'document_number' => $request->document_number,
                'password'        => Hash::make($request->password),
            ],
        ], now()->addMinutes(10));

        try {
            Mail::to($request->email)->send(new VerifyCodeEmail($code));

            return response()->json([
                'status'  => 'success',
                'message' => 'Código enviado. Revisa tu bandeja e ingrésalo para activar tu cuenta.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No se pudo enviar el código de verificación. Inténtalo de nuevo.',
            ], 500);
        }
    }

    // Paso 2: valida el código y crea el usuario, dejándolo logueado en la web.
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|digits:6',
        ]);

        $key   = 'register:' . $request->email;
        $entry = Cache::get($key);

        if (!$entry) {
            return response()->json(['status' => 'error', 'message' => 'Código inválido o expirado.'], 400);
        }

        // Límite de intentos por registro: sin esto un código de 6 dígitos es
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

        $data = $entry['data'];
        $data['accepted_terms_at'] = now();

        $user = User::create($data);
        Cache::forget($key);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'status'  => 'success',
            'message' => 'Cuenta verificada y creada correctamente.',
        ]);
    }
}
