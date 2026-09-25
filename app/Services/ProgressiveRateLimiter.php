<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

/**
 * Rate limiter con BLOQUEO ESCALONADO sobre Redis (cache store).
 *
 * Idea: cada vez que una clave (usuario/IP + acción) se pasa del límite, se la
 * bloquea; y si REINCIDE, el bloqueo dura más cada vez (5 → 15 → 30 → 60 → 120 →
 * 240 min). La "reincidencia" se recuerda 24 h. Todo es atómico (INCR de Redis) y
 * compartido entre servidores.
 */
class ProgressiveRateLimiter
{
    /** Minutos de bloqueo según cuántas veces ya se pasó del límite. */
    private const BAN_SCHEDULE = [5, 15, 30, 60, 120, 240];

    /** Cuánto se recuerda la reincidencia (para seguir escalando). */
    private const STRIKE_TTL_HOURS = 24;

    /** Segundos restantes de bloqueo, o null si no está bloqueado. */
    public function bannedFor(string $key): ?int
    {
        $until = (int) Cache::get("rl:ban:{$key}", 0);
        $remaining = $until - time();

        return $remaining > 0 ? $remaining : null;
    }

    /**
     * Registra un intento. Si supera $maxAttempts dentro de la ventana, aplica el
     * bloqueo escalonado y devuelve los segundos bloqueado; si no, null.
     */
    public function hit(string $key, int $maxAttempts, int $windowSeconds): ?int
    {
        $countKey = "rl:count:{$key}";

        // add() fija el TTL solo en el primer intento; increment() no lo reinicia.
        Cache::add($countKey, 0, $windowSeconds);
        $count = (int) Cache::increment($countKey);

        if ($count <= $maxAttempts) {
            return null;
        }

        $strikeKey = "rl:strikes:{$key}";
        $strikes   = (int) Cache::get($strikeKey, 0);
        $minutes   = self::BAN_SCHEDULE[min($strikes, count(self::BAN_SCHEDULE) - 1)];

        Cache::put($strikeKey, $strikes + 1, now()->addHours(self::STRIKE_TTL_HOURS));
        Cache::put("rl:ban:{$key}", time() + $minutes * 60, $minutes * 60);
        Cache::forget($countKey);

        return $minutes * 60;
    }

    /** Limpia contador, bloqueo y reincidencia (p. ej. tras un login exitoso). */
    public function clear(string $key): void
    {
        Cache::forget("rl:count:{$key}");
        Cache::forget("rl:ban:{$key}");
        Cache::forget("rl:strikes:{$key}");
    }
}
