<?php
// app/Http/Controllers/AdminAuthController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AdminAccount;
use Inertia\Inertia;
class AdminAuthController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::guard('admin')->check()) {
        return redirect('/admin/dashboard');
    }
         return Inertia::render('Admin/login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Bloqueo por intentos fallidos (email + IP), además del throttle de la ruta.
        $limiter = app(\App\Services\AuthRateLimiter::class);
        $email   = (string) $request->input('email');

        if ($limiter->tooManyAttempts($request, $email)) {
            $seconds = $limiter->availableIn($request, $email);
            return response()->json([
                'success' => false,
                'message' => "Demasiados intentos de acceso. Intenta nuevamente en {$seconds} segundos.",
            ], 429);
        }

        if (Auth::guard('admin')->attempt($request->only('email','password'))) {
            // Login exitoso
            $limiter->clear($request, $email);
            return response()->json([
                'success' => true,
                'redirect' => url('/admin/dashboard')
            ]);
        }

        $limiter->hit($request, $email);

        return response()->json([
            'success' => false,
            'message' => 'Credenciales incorrectas'
        ], 401);
    }


    public function logout(Request $request)
{
    Auth::guard('admin')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect()->route('admin.login');
}
}