<?php

namespace App\Http\Middleware;

use App\Services\ProgressiveRateLimiter;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Limita peticiones por (ruta + usuario/IP) con BLOQUEO ESCALONADO: al pasarse del
 * límite se banea, y si reincide el bloqueo dura cada vez más (5 → 15 → 30 → 60 →
 * 120 → 240 min). Devuelve un 429 limpio con Retry-After. Corre sobre Redis.
 *
 * Uso en rutas:
 *   ->middleware('ratelimit:10,1')   // 10 peticiones por 1 minuto
 */
class RateLimit
{
    public function handle(Request $request, Closure $next, int|string $maxAttempts = 10, int|string $decayMinutes = 1): Response
    {
        $maxAttempts   = (int) $maxAttempts;
        $windowSeconds = (int) $decayMinutes * 60;
        $key           = $this->resolveKey($request);
        $limiter       = app(ProgressiveRateLimiter::class);

        $banned = $limiter->bannedFor($key);
        if ($banned !== null) {
            return $this->tooMany($request, $banned);
        }

        $justBanned = $limiter->hit($key, $maxAttempts, $windowSeconds);
        if ($justBanned !== null) {
            return $this->tooMany($request, $justBanned);
        }

        return $next($request);
    }

    private function tooMany(Request $request, int $seconds): Response
    {
        $message = "Demasiados intentos. Intenta nuevamente en {$seconds} segundos.";

        if ($request->expectsJson()) {
            return response()->json([
                'code'        => 'rate_limited',
                'blocked'     => true,
                'message'     => $message,
                'retry_after' => $seconds,
            ], 429)->header('Retry-After', $seconds);
        }

        abort(429, $message);
    }

    /** Un cubo por ruta + usuario autenticado (o IP si es invitado). */
    private function resolveKey(Request $request): string
    {
        $id = $request->user()?->id ?: $request->ip();

        return Str::transliterate('rl|' . ($request->route()?->uri() ?? $request->path()) . '|' . $id);
    }
}
