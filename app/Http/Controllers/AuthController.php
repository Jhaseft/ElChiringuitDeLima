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

        // Buscar usuario por email
        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            $user = User::create([
                'first_name'   => $googleUser->user['given_name'] ?? $googleUser->getName(),
                'last_name'    => $googleUser->user['family_name'] ?? '',
                'email'        => $googleUser->getEmail(),
                'provider'     => 'google',
                'provider_id'  => $googleUser->getId(),
                'password'     => null,
            ]);

            Auth::login($user);
            return redirect()->route('complete-profile');
        }

        // Si  tiene perfil incompleto, redirigir
        if (empty($user->nationality) || empty($user->phone) || empty($user->accepted_terms_at) || empty($user->document_number)) {
            Auth::login($user);
            return redirect()->route('complete-profile');
        }

        Auth::login($user);
        return redirect()->route('welcome');
    }
}
