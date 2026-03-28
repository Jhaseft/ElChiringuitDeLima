<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TipoCambio;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Mail\TipoCambioActualizadoMail;
 
class AdminControllerDashboard extends Controller
{
    // Ver tipo de cambio
    public function Dashboard()
{
    return Inertia::render('Admin/Dashboard');
}

    // Ver tipo de cambio
    public function tipoCambio()
{
    $tipoCambio = TipoCambio::select('id', 'compra', 'venta', 'fecha_actualizacion')
                ->orderBy('id', 'desc')
                ->limit(1)
                ->get()
                ->first();

    return Inertia::render('Admin/TipoCambio', [
        'tipoCambio' => $tipoCambio
    ]);
}

 
    // Actualizar tipo de cambio
    public function update(Request $request)
{
    $request->validate([
        'compra' => 'required|numeric',
        'venta' => 'required|numeric',
    ]);

    // Crear un nuevo registro en la tabla
    $tipoCambio = new TipoCambio();
    $tipoCambio->compra = $request->compra;
    $tipoCambio->venta = $request->venta;
    $tipoCambio->fecha_actualizacion = now();
    $tipoCambio->save();

    // Enviar mail a todos los usuarios (en cola, para no bloquear el request)
    $users = User::all();
    foreach ($users as $user) {
        Mail::to($user->email)->queue(new TipoCambioActualizadoMail($tipoCambio));
    }

    return response()->json(['success' => true, 'tipoCambio' => $tipoCambio]);
}


// Historial de tipo de cambio
public function historial()
{
    $historial = TipoCambio::orderBy('id', 'desc')
        ->limit(50)
        ->get()
        ->reverse()
        ->values();

    return response()->json($historial);
}

   public function actualizarTipoCambioAutomatico()
{
    try {

        // ===============================
        // CONSULTAR BINANCE P2P
        // ===============================

        // Función anónima que obtiene el mejor precio de USDT
        // para la moneda fiat que se le pase (PEN o BOB)
        $fetchPrice = function (string $fiat, string $tradeType): float {
            $response = Http::post(
                'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
                [
                    "asset"         => "USDT",
                    "fiat"          => $fiat,
                    "tradeType"     => $tradeType,
                    "page"          => 1,
                    "rows"          => 20,
                    "payTypes"      => [],
                    "publisherType" => "merchant"
                ]
            );

            $data = $response->json();

            $top = collect($data['data'] ?? [])
                ->filter(function ($item) {
                    return isset($item['adv'], $item['advertiser']) &&
                        floatval($item['adv']['tradableQuantity']) > 0;
                })
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
        //  CALCULAR CONVERSIÓN
        // ===============================

        // COMPRA base: cuántos BOB da TC por cada PEN recibido
        $compraBase = round($bobSell / $penBuy, 4);

        // VENTA base: cuántos BOB cobra TC por cada PEN que entrega
        $ventaBase  = round($bobBuy  / $penSell, 4);

        // Margen adicional del 1% sobre el spread real de Binance
        $margen = 0.01;
        $compra = round($compraBase * (1 - $margen), 2);
        $venta  = round($ventaBase  * (1 + $margen), 2);

        // Promoción: +3 pips de bonificación al cliente
        $pipsPromocion = 0.03;
        $compra = round($compra + $pipsPromocion, 2);
        $venta  = round($venta  + $pipsPromocion, 2);

        // ===============================
        //  GUARDAR EN BD
        // ===============================

        $tipoCambio = TipoCambio::create([
            'compra' => $compra,
            'venta'  => $venta,
            'fecha_actualizacion' => now()
        ]);

        return response()->json([
            'success'         => true,
            'tipoCambio'      => $tipoCambio,
            'pen_buy'         => $penBuy,
            'pen_sell'        => $penSell,
            'bob_buy'         => $bobBuy,
            'bob_sell'        => $bobSell,
            'compra_base'     => $compraBase,
            'venta_base'      => $ventaBase,
            'compra_final'    => $compra,
            'venta_final'     => $venta,
        ]);

    } catch (\Exception $e) {

        // Si ocurre cualquier error:
        // Se guarda en logs
        Log::error("Error actualizando tipo de cambio: " . $e->getMessage());

        // Se devuelve error en formato JSON
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}




}
