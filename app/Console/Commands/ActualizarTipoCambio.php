<?php

namespace App\Console\Commands;

use App\Models\Configuracion;
use App\Models\TipoCambio;
use App\Services\TipoCambioService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
 
class ActualizarTipoCambio extends Command
{
    protected $signature   = 'tipo-cambio:actualizar';
    protected $description = 'Obtiene el tipo de cambio PEN/BOB desde Binance P2P y lo guarda si cambió';

    public function handle(TipoCambioService $service): int
    {
        try {
            $tc     = $service->calcular();
            $compra = $tc['compra'];
            $venta  = $tc['venta'];

            // ===============================
            // MODO MANUAL → tipo de cambio fijo
            // ===============================
            // Si el admin desactivó el modo automático, NO se guarda nada:
            // el tipo de cambio queda fijo. Solo informamos a qué valor
            // cambiaría si se reactivara el modo automático.
            if (!Configuracion::get('modo_automatico', true)) {
                $this->info("Modo manual activo. Tipo de cambio fijo. No se guardó (calculado: compra $compra | venta $venta).");
                Log::info("TipoCambio: modo manual, sin cambios (calculado $compra / $venta).");
                return self::SUCCESS;
            }

            // ===============================
            // GUARDAR SOLO SI CAMBIÓ
            // ===============================
            $ultimo = TipoCambio::select('compra', 'venta')->orderBy('id', 'desc')->first();

            if (
                $ultimo &&
                number_format((float) $ultimo->compra, 2) === number_format($compra, 2) &&
                number_format((float) $ultimo->venta, 2)  === number_format($venta, 2)
            ) {
                $this->info("Sin cambios (compra: $compra | venta: $venta). No se guardó.");
                Log::info("TipoCambio: sin cambios ($compra / $venta).");
                return self::SUCCESS;
            }

            TipoCambio::create([
                'compra'              => $compra,
                'venta'               => $venta,
                'fecha_actualizacion' => now(),
            ]);

            $this->info("Tipo de cambio actualizado → compra: $compra | venta: $venta");

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error("ActualizarTipoCambio error: " . $e->getMessage());
            return self::FAILURE;
        }
    }
}
