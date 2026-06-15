<?php

namespace App\Services;

use App\Models\Configuracion;
use Illuminate\Support\Facades\Http;

class TipoCambioService
{ 
    /**
     * Consulta Binance P2P y calcula el tipo de cambio (compra/venta)
     * SIN guardarlo en la base de datos.
     *
     * @return array{compra: float, venta: float, compra_base: float, venta_base: float, pen_buy: float, pen_sell: float, bob_buy: float, bob_sell: float}
     */
    public function calcular(): array
    {
        // COMPRA: cliente da PEN → TC compra USDT con PEN (BUY PEN) → TC vende USDT por BOB (SELL BOB)
        $penBuy  = $this->fetchPrice('PEN', 'BUY');
        $bobSell = $this->fetchPrice('BOB', 'SELL');

        // VENTA: cliente da BOB → TC compra USDT con BOB (BUY BOB) → TC vende USDT por PEN (SELL PEN)
        $bobBuy  = $this->fetchPrice('BOB', 'BUY');
        $penSell = $this->fetchPrice('PEN', 'SELL');

        // COMPRA: cuántos BOB da TC por 1 PEN del cliente
        $compraBase = round($bobSell / $penBuy, 4);

        // VENTA: cuántos BOB pide TC por 1 PEN que entrega al cliente
        $ventaBase = round($bobBuy / $penSell, 4);

        // Margen (editable desde .env → TRANSFER_MARGEN)
        $margen = config('transfercash.margen');
        $compra = round($compraBase * (1 - $margen), 2);
        $venta  = round($ventaBase  * (1 + $margen), 2);

        // Pips administrables desde la tabla configuracion
        $compra = round($compra + Configuracion::get('pips_compra', 0), 2);
        $venta  = round($venta  + Configuracion::get('pips_venta',  0), 2);

        return [
            'compra'      => $compra,
            'venta'       => $venta,
            'compra_base' => $compraBase,
            'venta_base'  => $ventaBase,
            'pen_buy'     => $penBuy,
            'pen_sell'    => $penSell,
            'bob_buy'     => $bobBuy,
            'bob_sell'    => $bobSell,
        ];
    }

    /**
     * Obtiene el mejor precio de USDT para la moneda fiat indicada.
     */
    private function fetchPrice(string $fiat, string $tradeType): float
    {
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
    }
}
