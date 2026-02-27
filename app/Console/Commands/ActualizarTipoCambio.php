<?php

namespace App\Console\Commands;

use App\Models\TipoCambio;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ActualizarTipoCambio extends Command
{
    protected $signature   = 'tipo-cambio:actualizar';
    protected $description = 'Obtiene el tipo de cambio PEN/BOB desde Binance P2P y lo guarda si cambió';

    public function handle(): int
    {
        try {
            // ===============================
            // CONSULTAR BINANCE P2P
            // ===============================

            $fetchPrice = function (string $fiat): float {
                $response = Http::post(
                    'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
                    [
                        'asset'         => 'USDT',
                        'fiat'          => $fiat,
                        'tradeType'     => 'BUY',
                        'page'          => 1,
                        'rows'          => 20,
                        'payTypes'      => [],
                        'publisherType' => 'merchant',
                    ]
                );

                $data = $response->json();

                $top = collect($data['data'] ?? [])
                    ->filter(fn($item) =>
                        isset($item['adv'], $item['advertiser']) &&
                        floatval($item['adv']['tradableQuantity']) > 0
                    )
                    ->sort(function ($a, $b) {
                        if ($b['advertiser']['monthFinishRate'] != $a['advertiser']['monthFinishRate']) {
                            return $b['advertiser']['monthFinishRate'] <=> $a['advertiser']['monthFinishRate'];
                        }
                        if ($b['advertiser']['monthOrderCount'] != $a['advertiser']['monthOrderCount']) {
                            return $b['advertiser']['monthOrderCount'] <=> $a['advertiser']['monthOrderCount'];
                        }
                        return floatval($a['adv']['price']) <=> floatval($b['adv']['price']);
                    })
                    ->values()
                    ->first();

                if (!$top) {
                    throw new \Exception("No se encontró precio para $fiat");
                }

                return floatval($top['adv']['price']);
            };

            $precioPen = $fetchPrice('PEN');
            $precioBob = $fetchPrice('BOB');

            // ===============================
            // CALCULAR CONVERSIÓN Y MÁRGENES
            // ===============================

            $penBob = round($precioBob / $precioPen, 2);
            $margen = 0.02;
            $compra = round($penBob * (1 - $margen), 2);
            $venta  = round($penBob * (1 + $margen), 2);

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
            Log::info("TipoCambio actualizado: compra=$compra, venta=$venta");

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error("ActualizarTipoCambio error: " . $e->getMessage());
            return self::FAILURE;
        }
    }
}
