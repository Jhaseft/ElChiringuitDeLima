<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Corta el acceso de un usuario bloqueado por el admin AUNQUE ya tenga una sesión
// abierta (token Sanctum en la app o sesión web): sin esto, el bloqueo solo
// afectaría a logins nuevos. Se aplica en el grupo 'auth:sanctum' (api.php) y en
// los grupos 'auth' web (web.php / auth.php).
class EnsureUserNotBlocked
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->isBlocked()) {
            // App móvil (o cualquier cliente que espera JSON): revocar el token
            // actual y responder 403.
            if ($request->expectsJson()) {
                $request->user()->currentAccessToken()?->delete();

                return response()->json([
                    'message' => 'Tu cuenta ha sido bloqueada. Comunícate con soporte.',
                    'blocked' => true,
                ], 403);
            }

            // Web: cerrar la sesión y mandar al inicio con el mensaje.
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('welcome')
                ->with('error', 'Tu cuenta ha sido bloqueada. Comunícate con soporte.');
        }

        return $next($request);
    }
}
