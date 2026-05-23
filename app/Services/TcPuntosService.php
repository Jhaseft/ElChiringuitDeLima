<?php

namespace App\Services;
 
use App\Models\TcPunto;
use App\Models\TcPuntoTransaccion;
use App\Models\TcCategoria;
use App\Models\TcCanje;
use App\Models\TcProducto;
use App\Models\Transfer;
use Illuminate\Support\Facades\DB;

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

    public function calcularPuntos(Transfer $transfer): int
    {
        $soles = $transfer->modo === 'PENtoBOB'
            ? (float) $transfer->amount
            : (float) $transfer->converted_amount;

        return (int) floor($soles / $this->umbral());
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
    }

    public function catalogo()
    {
        return TcCategoria::with(['productos' => fn($q) => $q->where('activo', 1)->orderBy('orden')])
            ->where('activo', 1)
            ->orderBy('orden')
            ->get();
    }

    public function canjear(string $userId, int $productoId): array
    {
        return DB::transaction(function () use ($userId, $productoId) {
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

            return [
                'balance'  => (float) $saldo->fresh()->balance,
                'producto' => $producto->nombre,
            ];
        });
    }

    public function saldo(string $userId): float
    {
        return (float) TcPunto::where('user_id', $userId)->value('balance') ?? 0;
    }

    public function historial(string $userId, int $perPage = 15)
    {
        return TcPuntoTransaccion::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
