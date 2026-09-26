<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    //muestra el fomrulario del log in 
    public function create(): Response 
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    //hacer log in interno y donde redireccionar
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        // Usuario bloqueado por el admin: no se le abre sesión.
        if (Auth::user()->isBlocked()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('welcome')
                ->with('error', 'Tu cuenta ha sido bloqueada. Comunícate con soporte.');
        }

        $request->session()->regenerate();

       return redirect()->route('welcome');

    }

    //Hacer Log Out
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
