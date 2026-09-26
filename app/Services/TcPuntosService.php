<?php

namespace App\Services;
 
use App\Models\TcPunto;
use App\Models\TcPuntoTransaccion;
use App\Models\TcCategoria;
use App\Models\TcCanje;
use App\Models\TcProducto;
use App\Models\Transfer;
use App\Models\User;
use App\Mail\CanjeInstruccionesMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TcPuntosService
{
    public function umbral(): float
    {
        return (float) env('TC_PUNTOS_UMBRAL', 1000);
    }

    public function valorPunto(): float
    {
        return (float) env('TC_PUNTOS_VALOR', 1);
    }

    public function moneda(): string
    {
        return (string) env('TC_PUNTOS_MONEDA', 'S/');
    }

    public function calcularPuntos(Transfer $transfer): float
    {
        $soles = $transfer->modo === 'PENtoBOB'
            ? (float) $transfer->amount
            : (float) $transfer->converted_amount;

        return round($soles / $this->umbral(), 2);
    }

    public function otorgarPuntos(Transfer $transfer): void
    {
        $puntos = $this->calcularPuntos($transfer);

        if ($puntos <= 0) {
            return;
        }

        // Idempotencia: no otorgar si ya se procesó esta transferencia
        $yaOtorgado = TcPuntoTransaccion::where('transfer_id', $transfer->id)
            ->where('tipo', 'ganado')
            ->exists();

        if ($yaOtorgado) {
            return;
        }

        DB::transaction(function () use ($transfer, $puntos) {
            $saldo = TcPunto::firstOrCreate(
                ['user_id' => $transfer->user_id],
                ['balance' => 0]
            );

            $saldo->increment('balance', $puntos);

            TcPuntoTransaccion::create([
                'user_id'     => $transfer->user_id,
                'transfer_id' => $transfer->id,
                'puntos'      => $puntos,
                'tipo'        => 'ganado',
                'descripcion' => "Transferencia #{$transfer->id} completada ({$transfer->modo})",
            ]);
        });

        Cache::forget("tcpuntos_saldo:user:{$transfer->user_id}");
    }

    public function catalogo()
    {
        // Catálogo global cacheado (TTL 30 min como red de seguridad). Se invalida
        // al editar productos/categorías (observers) y al canjear (baja el stock).
        return Cache::remember('tcpuntos_catalogo', now()->addMinutes(30), function () {
            return TcCategoria::with(['productos' => fn($q) => $q->where('activo', 1)->orderBy('orden')])
                ->where('activo', 1)
                ->orderBy('orden')
                ->get();
        });
    }

    public function canjear(string $userId, int $productoId): array
    {
        ['producto' => $producto, 'balance' => $balance] = DB::transaction(function () use ($userId, $productoId) {
            $producto = TcProducto::where('id', $productoId)
                ->where('activo', 1)
                ->lockForUpdate()
                ->firstOrFail();

            if ($producto->stock !== null && $producto->stock <= 0) {
                throw new \RuntimeException('Sin stock disponible', 422);
            }

            $saldo = TcPunto::where('user_id', $userId)->lockForUpdate()->first();

            if (!$saldo || $saldo->balance < $producto->costo_puntos) {
                throw new \RuntimeException('Saldo insuficiente', 422);
            }

            $saldo->decrement('balance', $producto->costo_puntos);

            if ($producto->stock !== null) {
                $producto->decrement('stock');
                Cache::forget('tcpuntos_catalogo');
            }

            TcCanje::create([
                'user_id'      => $userId,
                'producto_id'  => $productoId,
                'puntos_usados' => $producto->costo_puntos,
                'status'       => 'pendiente',
            ]);

            TcPuntoTransaccion::create([
                'user_id'     => $userId,
                'transfer_id' => null,
                'puntos'      => $producto->costo_puntos,
                'tipo'        => 'canjeado',
                'descripcion' => "Canje: {$producto->nombre}",
            ]);

            Cache::forget("tcpuntos_saldo:user:{$userId}");

            return [
                'producto' => $producto,
                'balance'  => (float) $saldo->fresh()->balance,
            ];
        });

        $this->enviarCorreoCanje($userId, $producto);

        return [
            'balance'  => $balance,
            'producto' => $producto->nombre,
        ];
    }

    // Correo con las instrucciones que el admin configuró por producto. Se envía
    // fuera de la transacción; un fallo de correo no revierte el canje.
    private function enviarCorreoCanje(string $userId, TcProducto $producto): void
    {
        try {
            $email = User::where('id', $userId)->value('email');

            if (!$email) {
                return;
            }

            Mail::to($email)->send(new CanjeInstruccionesMail(
                $producto->nombre,
                (float) $producto->costo_puntos,
                $producto->instrucciones_correo,
                $producto->imagen_url,
            ));
        } catch (\Throwable $e) {
            Log::error('Error enviando correo de canje TC', [
                'user_id'     => $userId,
                'producto_id' => $producto->id,
                'msg'         => $e->getMessage(),
            ]);
        }
    }

    public function saldo(string $userId): float
    {
        // Cache por-usuario (TTL 10 min). Se invalida al ganar u otorgar puntos.
        return Cache::remember("tcpuntos_saldo:user:{$userId}", now()->addMinutes(10), function () use ($userId) {
            return (float) (TcPunto::where('user_id', $userId)->value('balance') ?? 0);
        });
    }

    public function historial(string $userId, int $perPage = 15)
    {
        return TcPuntoTransaccion::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
