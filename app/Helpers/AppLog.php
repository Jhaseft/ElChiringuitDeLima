<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;

class AppLog
{
    public static function error(string $mensaje, array $contexto = [], string $canal = null): void
    {
        self::guardar('error', $mensaje, $contexto, $canal);
    }

    public static function info(string $mensaje, array $contexto = [], string $canal = null): void
    {
        self::guardar('info', $mensaje, $contexto, $canal);
    }

    public static function warning(string $mensaje, array $contexto = [], string $canal = null): void
    {
        self::guardar('warning', $mensaje, $contexto, $canal);
    }

    private static function guardar(string $level, string $mensaje, array $contexto, ?string $canal): void
    {
        try {
            DB::table('activity_logs')->insert([
                'level'      => $level,
                'canal'      => $canal,
                'mensaje'    => $mensaje,
                'contexto'   => !empty($contexto) ? json_encode($contexto, JSON_UNESCAPED_UNICODE) : null,
                'user_id'    => auth()->id(),
                'ip'         => request()?->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // Si falla el log no debe romper la app
        }
    }
}
