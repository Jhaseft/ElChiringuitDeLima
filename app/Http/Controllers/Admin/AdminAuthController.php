<?php
// app/Http/Controllers/AdminAuthController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AdminAccount;
use App\Models\AdminRole;
use Inertia\Inertia;
class AdminAuthController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::guard('admin')->check()) {
            $landing = AdminRole::landingPathFor(Auth::guard('admin')->user());
            return redirect($landing ?? '/admin/dashboard');
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

            // Aterriza en la primera pestana permitida por su rol. Si el rol no
            // tiene ninguna asignada, se cierra la sesion y se informa.
            $landing = AdminRole::landingPathFor(Auth::guard('admin')->user());
            if (!$landing) {
                Auth::guard('admin')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return response()->json([
                    'success' => false,
                    'message' => 'Tu usuario no tiene pestanas asignadas. Contacta al super administrador.',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'redirect' => url($landing),
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