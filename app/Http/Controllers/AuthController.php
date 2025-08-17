<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class AuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->scopes(['profile', 'email'])
            ->redirect();
    }
 
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::firstOrCreate(
                ['email' => $googleUser->email],
                [
                    'name'     => $googleUser->name ?? 'Usuario Google',
                    'password' => Hash::make(Str::random(32)),
                    'is_admin' => false,
                ]
            );

            Auth::login($user);
            session()->regenerate();

            return redirect()->route('welcome')->with('status', 'Inicio de sesión con Google exitoso.');
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'google' => 'Error al autenticar con Google. Intenta nuevamente.',
            ]);
        }
    }
}
