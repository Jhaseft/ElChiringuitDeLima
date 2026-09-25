<?php

namespace App\Http\Middleware;

use App\Services\ProgressiveRateLimiter;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Límite GLOBAL por usuario (una sola cuenta para TODA la app, no por ruta).
 *
 * Si un usuario hace demasiadas acciones en poco tiempo (p. ej. refrescar todo
 * en bucle), se le BLOQUEA de toda la app; y si reincide, el bloqueo escala
 * (5 → 15 → 30 → 60 → 120 → 240 min, ver ProgressiveRateLimiter). El bloqueo se
 * revisa en CADA request, así que mientras dure no puede hacer nada.
 *
 * Uso: ->middleware('globalratelimit:150,1')  // 150 acciones por 1 minuto
 */
class GlobalRateLimit
{
    public function handle(Request $request, Closure $next, int|string $maxAttempts = 150, int|string $decayMinutes = 1): Response
    {
        $key           = 'app|' . ($request->user()?->id ?: $request->ip());
        $windowSeconds = (int) $decayMinutes * 60;
        $limiter       = app(ProgressiveRateLimiter::class);

        $banned = $limiter->bannedFor($key);
        if ($banned !== null) {
            return $this->tooMany($request, $banned);
        }

        $justBanned = $limiter->hit($key, (int) $maxAttempts, $windowSeconds);
        if ($justBanned !== null) {
            return $this->tooMany($request, $justBanned);
        }

        return $next($request);
    }

    private function tooMany(Request $request, int $seconds): Response
    {
        $minutos = (int) ceil($seconds / 60);
        $message = "Estás realizando demasiadas acciones. Espera {$minutos} minuto(s) antes de continuar.";

        if ($request->expectsJson()) {
            return response()->json([
                'message'     => $message,
                'retry_after' => $seconds,
            ], 429)->header('Retry-After', $seconds);
        }

        abort(429, $message);
    }
}
