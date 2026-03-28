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

            $fetchPrice = function (string $fiat, string $tradeType): float {
                $response = Http::post(
                    'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
                    [
                        'asset'         => 'USDT',
                        'fiat'          => $fiat,
                        'tradeType'     => $tradeType,
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
                    throw new \Exception("No se encontró precio para $fiat ($tradeType)");
                }

                return floatval($top['adv']['price']);
            };

            // COMPRA: cliente da PEN → TC compra USDT con PEN (BUY PEN) → TC vende USDT por BOB (SELL BOB)
            $penBuy  = $fetchPrice('PEN', 'BUY');
            $bobSell = $fetchPrice('BOB', 'SELL');

            // VENTA: cliente da BOB → TC compra USDT con BOB (BUY BOB) → TC vende USDT por PEN (SELL PEN)
            $bobBuy  = $fetchPrice('BOB', 'BUY');
            $penSell = $fetchPrice('PEN', 'SELL');

            // ===============================
            // CALCULAR CONVERSIÓN Y MÁRGENES
            // ===============================

            // COMPRA: cuántos BOB da TC por 1 PEN del cliente (spread de mercado ya favorece a TC)
            $compraBase = round($bobSell / $penBuy, 4);

            // VENTA: cuántos BOB pide TC por 1 PEN que entrega al cliente
            $ventaBase  = round($bobBuy / $penSell, 4);

            // Margen adicional del 1% sobre el spread real de Binance
            $margen = 0.01;
            $compra = round($compraBase * (1 - $margen), 2);
            $venta  = round($ventaBase  * (1 + $margen), 2);

            // Promoción: +3 pips de bonificación al cliente
            $pipsPromocion = 0.04;
            $compra = round($compra + $pipsPromocion, 2);
            $venta  = round($venta  + $pipsPromocion, 2);

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
