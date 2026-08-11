<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        // El correo debe venir VERIFICADO por Google. Si no, no lo usamos para
        // identificar/loguear a nadie: de lo contrario alguien con un correo no
        // verificado que coincida con un usuario existente podría tomar su cuenta.
        $emailVerified = filter_var(
            $googleUser->user['email_verified'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        $email = $googleUser->getEmail();

        if (!$email || !$emailVerified) {
            return redirect()->route('welcome')
                ->with('error', 'Tu correo de Google no está verificado. Usa un correo verificado o regístrate con email y contraseña.');
        }

        // Buscar usuario por email
        $user = User::where('email', $email)->first();

        if (!$user) {
            $user = User::create([
                'first_name'   => $googleUser->user['given_name'] ?? $googleUser->getName(),
                'last_name'    => $googleUser->user['family_name'] ?? '',
                'email'        => $googleUser->getEmail(),
                'password'     => null,
            ]);

            Auth::login($user);
            return redirect()->route('complete-profile');
        }

        // Si  tiene perfil incompleto, redirigir
        if (empty($user->nationality) || empty($user->phone) || empty($user->document_number)) {
            Auth::login($user);
            return redirect()->route('complete-profile');
        }

        Auth::login($user);
        return redirect()->route('welcome');
    }
}
