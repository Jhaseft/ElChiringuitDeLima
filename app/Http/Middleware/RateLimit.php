<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Limita peticiones por (ruta + usuario/IP) devolviendo un 429 LIMPIO y
 * localizado, con cabecera Retry-After. Reemplaza al `throttle` plano de Laravel
 * para tener un mensaje consistente que no depende de APP_DEBUG ni filtra el
 * stack trace del framework.
 *
 * Uso en rutas:
 *   ->middleware('ratelimit:10,1')   // 10 peticiones por 1 minuto
 *   ->middleware('ratelimit:5,1')    // 5 por minuto
 */
class RateLimit
{
    public function handle(Request $request, Closure $next, int|string $maxAttempts = 10, int|string $decayMinutes = 1): Response
    {
        $maxAttempts  = (int) $maxAttempts;
        $decaySeconds = (int) $decayMinutes * 60;
        $key          = $this->resolveKey($request);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            $message = "Demasiados intentos. Intenta nuevamente en {$seconds} segundos.";

            if ($request->expectsJson()) {
                return response()->json([
                    'message'     => $message,
                    'retry_after' => $seconds,
                ], 429)->header('Retry-After', $seconds);
            }

            abort(429, $message);
        }

        RateLimiter::hit($key, $decaySeconds);

        $response = $next($request);

        // Cabeceras informativas (opcional, útil para el cliente).
        $response->headers->add([
            'X-RateLimit-Limit'     => $maxAttempts,
            'X-RateLimit-Remaining' => max(0, $maxAttempts - RateLimiter::attempts($key)),
        ]);

        return $response;
    }

    /** Un cubo por ruta + usuario autenticado (o IP si es invitado). */
    private function resolveKey(Request $request): string
    {
        $id = $request->user()?->id ?: $request->ip();

        return Str::transliterate('rl|' . ($request->route()?->uri() ?? $request->path()) . '|' . $id);
    }
}
