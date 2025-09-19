<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmail;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request)
{
    $request->validate([
        'first_name'       => 'required|string|max:255',
        'last_name'        => 'required|string|max:255',
        'email'            => 'required|string|email|max:255|unique:users,email',
        'phone'            => 'nullable|string|max:20|unique:users,phone',
        'nationality'      => 'nullable|string|max:100',
        'document_number'  => 'nullable|string|max:50|unique:users,document_number',
        'password'         => ['required', 'confirmed', Rules\Password::defaults()],
    ]);
 
    $token = Str::random(64);

    // Guardar datos en cache por 30 min
    Cache::put('register:' . $token, $request->all(), now()->addMinutes(30));

    $url = route('email.verify', ['token' => $token]);

    try {
        Mail::to($request->email)->send(new VerifyEmail($url));

        return response()->json([
            'status'  => 'success',
            'message' => 'Correo enviado. Revisa tu bandeja y confirma tu cuenta.',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status'  => 'error',
            'message' => 'No se pudo enviar el correo de verificación. Inténtalo de nuevo.',
        ], 500);
    }
}

}
