<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TipoCambio;
use App\Models\Transfer;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Mail\TipoCambioActualizadoMail;

class AdminControllerDashboard extends Controller
{
    public function Dashboard()
    {
        $now        = Carbon::now();
        $today      = $now->copy()->startOfDay();
        $yesterday  = $now->copy()->subDay()->startOfDay();
        $weekStart  = $now->copy()->startOfWeek();
        $monthStart = $now->copy()->startOfMonth();

        $resumen = function ($from, $to = null) {
            $q = Transfer::where('status', 'completed')->where('created_at', '>=', $from);
            if ($to) $q->where('created_at', '<', $to);

            $row = $q->selectRaw("
                    COUNT(*) as total_ops,
                    SUM(CASE WHEN modo = 'BOBtoPEN' THEN amount ELSE 0 END) as bob_in,
                    SUM(CASE WHEN modo = 'PENtoBOB' THEN converted_amount ELSE 0 END) as bob_out,
                    SUM(CASE WHEN modo = 'PENtoBOB' THEN amount ELSE 0 END) as pen_in,
                    SUM(CASE WHEN modo = 'BOBtoPEN' THEN converted_amount ELSE 0 END) as pen_out
                ")->first();

            return [
                'ops'     => (int)   ($row->total_ops ?? 0),
                'bob_in'  => (float) ($row->bob_in ?? 0),
                'bob_out' => (float) ($row->bob_out ?? 0),
                'pen_in'  => (float) ($row->pen_in ?? 0),
                'pen_out' => (float) ($row->pen_out ?? 0),
            ];
        };

        $hoy    = $resumen($today);
        $ayer   = $resumen($yesterday, $today);
        $semana = $resumen($weekStart);
        $mes    = $resumen($monthStart);

        // Pendientes y rechazadas últimos 30 días
        $estados = Transfer::where('created_at', '>=', $now->copy()->subDays(30))
            ->whereIn('status', ['pending', 'rejected'])
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // Serie diaria últimos 14 días (para el gráfico de ingresos)
        $desde = $now->copy()->subDays(13)->startOfDay();
        $serieRaw = Transfer::where('status', 'completed')
            ->where('created_at', '>=', $desde)
            ->selectRaw("DATE(created_at) as fecha, modo, SUM(amount) as origen")
            ->groupBy('fecha', 'modo')
            ->orderBy('fecha')
            ->get();

        $serie = [];
        for ($i = 0; $i < 14; $i++) {
            $d = $desde->copy()->addDays($i)->toDateString();
            $serie[$d] = ['fecha' => $d, 'bob_in' => 0, 'pen_in' => 0];
        }
        foreach ($serieRaw as $r) {
            if (!isset($serie[$r->fecha])) continue;
            if ($r->modo === 'BOBtoPEN') {
                $serie[$r->fecha]['bob_in'] += (float) $r->origen;
            } else {
                $serie[$r->fecha]['pen_in'] += (float) $r->origen;
            }
        }

        $tipoCambio = TipoCambio::orderByDesc('id')->first();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'hoy'    => $hoy,
                'ayer'   => $ayer,
                'semana' => $semana,
                'mes'    => $mes,
                'estados' => [
                    'pending'  => (int) ($estados['pending']  ?? 0),
                    'rejected' => (int) ($estados['rejected'] ?? 0),
                ],
                'serie'      => array_values($serie),
                'tipoCambio' => $tipoCambio,
            ],
        ]);
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

        // Margen (editable desde .env → TRANSFER_MARGEN)
        $margen = config('transfercash.margen');
        $compra = round($compraBase * (1 - $margen), 2);
        $venta  = round($ventaBase  * (1 + $margen), 2);

        // Promoción por separado (editables desde .env → TRANSFER_PIPS_COMPRA / TRANSFER_PIPS_VENTA)
        $compra = round($compra + config('transfercash.pips_compra'), 2);
        $venta  = round($venta  + config('transfercash.pips_venta'),  2);

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
