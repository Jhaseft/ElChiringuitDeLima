<?php

namespace App\Services;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Rate limiter de autenticación basado en INTENTOS FALLIDOS por (identificador + IP),
 * con BLOQUEO ESCALONADO: tras N fallos se bloquea, y si reincide el bloqueo dura
 * cada vez más (ver ProgressiveRateLimiter). Se limpia al acertar la contraseña.
 *
 * Se usa en todos los logins (web, app móvil y admin).
 */
class AuthRateLimiter
{
    public function __construct(
        private int $maxAttempts = 4,
        private int $decaySeconds = 60,
        private ?ProgressiveRateLimiter $limiter = null,
    ) {
        $this->limiter ??= app(ProgressiveRateLimiter::class);
    }

    /** ¿Está bloqueado por superar los intentos fallidos? */
    public function tooManyAttempts(Request $request, string $identifier): bool
    {
        return $this->limiter->bannedFor($this->key($request, $identifier)) !== null;
    }

    /** Segundos que faltan para poder reintentar. */
    public function availableIn(Request $request, string $identifier): int
    {
        return $this->limiter->bannedFor($this->key($request, $identifier)) ?? 0;
    }

    /** Registra un intento fallido (puede disparar un bloqueo escalonado). */
    public function hit(Request $request, string $identifier): void
    {
        $this->limiter->hit($this->key($request, $identifier), $this->maxAttempts, $this->decaySeconds);
    }

    /** Limpia el contador y bloqueo (tras un login exitoso). */
    public function clear(Request $request, string $identifier): void
    {
        $this->limiter->clear($this->key($request, $identifier));
    }

    /**
     * Lanza ValidationException si está bloqueado. Para rutas web / FormRequests.
     * Para APIs que devuelven JSON propio, usa tooManyAttempts() + availableIn().
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
        return Str::transliterate('auth|' . Str::lower($identifier) . '|' . $request->ip());
    }
}
