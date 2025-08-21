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
    // Mostrar el formulario de login
    public function create(): Response 
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    // Hacer login y redireccionar
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Verificar si el perfil está completo
        if (empty($user->nationality) 
            || empty($user->phone) 
            || empty($user->accepted_terms_at) 
            || empty($user->document_number)) {
            return redirect()->route('complete-profile')
                ->with('warning', 'Debes completar tu perfil antes de continuar.');
        }

        return redirect()->route('welcome');
    }

    // Hacer logout
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
