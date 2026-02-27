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
    // Obtener los últimos 50 registros, ordenados de más antiguo a más reciente
    $historial = TipoCambio::orderBy('id', 'asc')->limit(50)->get();
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
        $fetchPrice = function ($fiat) {

            // Hace una petición POST al endpoint P2P de Binance
            // buscando anuncios donde se VENDE USDT (tradeType BUY = tú compras USDT)
            $response = Http::post(
                'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
                [
                    "asset" => "USDT",        // Cripto que se está negociando
                    "fiat" => $fiat,          // Moneda local (PEN o BOB)
                    "tradeType" => "BUY",     // Tipo de operación
                    "page" => 1,              // Página 1 de resultados
                    "rows" => 20,             // Trae 20 anuncios
                    "payTypes" => [],         // Sin filtro por método de pago
                    "publisherType" => "merchant" // Solo comerciantes verificados
                ]
            );

            // Convierte la respuesta JSON en array
            $data = $response->json();

            // Procesa los anuncios recibidos
            $ranked = collect($data['data'] ?? [])
                // Filtra solo anuncios válidos y con saldo disponible
                ->filter(function ($item) {
                    return isset($item['adv'], $item['advertiser']) &&
                        floatval($item['adv']['tradableQuantity']) > 0;
                })
                // Ordena los anuncios según prioridad
                ->sort(function ($a, $b) {

                    //  Mayor tasa de finalización mensual primero
                    if ($b['advertiser']['monthFinishRate'] != $a['advertiser']['monthFinishRate']) {
                        return $b['advertiser']['monthFinishRate'] <=> $a['advertiser']['monthFinishRate'];
                    }

                    //  Mayor cantidad de órdenes mensuales
                    if ($b['advertiser']['monthOrderCount'] != $a['advertiser']['monthOrderCount']) {
                        return $b['advertiser']['monthOrderCount'] <=> $a['advertiser']['monthOrderCount'];
                    }

                    // Mejor precio (más barato primero)
                    return floatval($a['adv']['price']) <=> floatval($b['adv']['price']);
                })
                ->values(); // Reindexa el array

            // Obtiene el mejor anuncio después del ranking
            $top = $ranked->first();

            // Si no se encontró ningún anuncio válido, lanza excepción
            if (!$top) {
                throw new \Exception("No se encontró precio para $fiat");
            }

            // Devuelve el precio del mejor anuncio encontrado
            return floatval($top['adv']['price']);
        };

        // Obtiene precio de 1 USDT en PEN
        $precioPen = $fetchPrice('PEN');

        // Obtiene precio de 1 USDT en BOB
        $precioBob = $fetchPrice('BOB');

        // ===============================
        //  CALCULAR CONVERSIÓN
        // ===============================

        // Calcula cuánto vale 1 BOB en PEN usando USDT como puente:
        // (BOB por USDT) / (PEN por USDT)
        $penBob = round($precioBob / $precioPen, 2);

        // ===============================
        //  DEFINIR COMPRA Y VENTA
        // ===============================

        /*
        COMPRA: Precio al que tú compras PEN (más bajo)
        VENTA: Precio al que tú vendes PEN (más alto)
        */

        // Margen de ganancia del 2%
        $margen = 0.02;

        // Precio de compra con margen aplicado hacia abajo
        $compra = round($penBob * (1 - $margen), 2);

        // Precio de venta con margen aplicado hacia arriba
        $venta  = round($penBob * (1 + $margen), 2);

        // ===============================
        //  GUARDAR EN BD
        // ===============================

        // Guarda el nuevo tipo de cambio en la base de datos
        $tipoCambio = TipoCambio::create([
            'compra' => $compra,
            'venta' => $venta,
            'fecha_actualizacion' => now()
        ]);

        // Devuelve respuesta exitosa con todos los datos calculados
        return response()->json([
            'success' => true,
            'tipoCambio' => $tipoCambio,
            'precio_usdt_pen' => $precioPen,
            'precio_usdt_bob' => $precioBob,
            'conversion_pen_bob' => $penBob
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
