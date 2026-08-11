<?php

namespace App\Services;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Rate limiter de autenticación basado en INTENTOS FALLIDOS por (identificador + IP).
 *
 * Es más robusto que un `throttle:x,y` plano por ruta porque:
 *   - Solo penaliza los intentos FALLIDOS (se limpia al acertar).
 *   - Aísla por email/usuario + IP, no castiga a toda la IP por igual.
 *   - Expone los segundos restantes para informar al cliente.
 *
 * Extraído del LoginRequest de Breeze para reutilizarlo en todos los logins
 * (web, app móvil y admin).
 */
class AuthRateLimiter
{
    public function __construct(
        private int $maxAttempts = 5,
        private int $decaySeconds = 60,
    ) {}

    /** ¿Se superó el límite de intentos fallidos para esta clave? */
    public function tooManyAttempts(Request $request, string $identifier): bool
    {
        return RateLimiter::tooManyAttempts($this->key($request, $identifier), $this->maxAttempts);
    }

    /** Segundos que faltan para poder reintentar. */
    public function availableIn(Request $request, string $identifier): int
    {
        return RateLimiter::availableIn($this->key($request, $identifier));
    }

    /** Registra un intento fallido. */
    public function hit(Request $request, string $identifier): void
    {
        RateLimiter::hit($this->key($request, $identifier), $this->decaySeconds);
    }

    /** Limpia el contador (tras un login exitoso). */
    public function clear(Request $request, string $identifier): void
    {
        RateLimiter::clear($this->key($request, $identifier));
    }

    /**
     * Lanza ValidationException si está bloqueado. Pensado para rutas web /
     * FormRequests (Inertia muestra el error). Para APIs que devuelven un JSON
     * propio, usa tooManyAttempts() + availableIn() y arma tu respuesta 429.
     */
    public function ensureNotLocked(Request $request, string $identifier, string $field = 'email'): void
    {
        if (! $this->tooManyAttempts($request, $identifier)) {
            return;
        }

        event(new Lockout($request));

        $seconds = $this->availableIn($request, $identifier);

        throw ValidationException::withMessages([
            $field => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /** Clave única por identificador + IP (normalizada). */
    private function key(Request $request, string $identifier): string
    {
        return Str::transliterate(Str::lower($identifier) . '|' . $request->ip());
    }
}
