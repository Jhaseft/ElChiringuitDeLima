<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use App\Models\TipoCambio;
use App\Models\Transfer;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Mail\TipoCambioActualizadoMail;
use App\Services\TipoCambioService;

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
        'tipoCambio'      => $tipoCambio,
        'pips_compra'     => Configuracion::get('pips_compra', 0.03),
        'pips_venta'      => Configuracion::get('pips_venta', -0.01),
        'modo_automatico' => Configuracion::get('modo_automatico', true),
    ]);
}

 
    // Actualizar tipo de cambio
    public function update(Request $request)
{
    $modoAutomatico = $request->boolean('modo_automatico');

    Configuracion::where('clave', 'modo_automatico')->update(['valor' => $modoAutomatico ? '1' : '0']);

    if ($modoAutomatico) {
        // MODO AUTOMÁTICO: el bot calcula el TC; el admin solo ajusta los pips.
        $data = $request->validate([
            'pips_compra' => 'required|numeric',
            'pips_venta'  => 'required|numeric',
        ]);

        Configuracion::where('clave', 'pips_compra')->update(['valor' => $data['pips_compra']]);
        Configuracion::where('clave', 'pips_venta')->update(['valor' => $data['pips_venta']]);

        return response()->json([
            'success'         => true,
            'modo_automatico' => true,
            'pips_compra'     => $data['pips_compra'],
            'pips_venta'      => $data['pips_venta'],
        ]);
    }

    // MODO MANUAL: el admin define el TC a su antojo → se agrega un nuevo registro.
    // La app siempre toma el último, así que basta con crear una fila nueva.
    $data = $request->validate([
        'compra' => 'required|numeric|min:0',
        'venta'  => 'required|numeric|min:0',
    ]);

    $tipoCambio = TipoCambio::create([
        'compra'              => $data['compra'],
        'venta'               => $data['venta'],
        'fecha_actualizacion' => now(),
    ]);

    return response()->json([
        'success'         => true,
        'modo_automatico' => false,
        'tipoCambio'      => $tipoCambio,
    ]);
}

// Calcula a qué tipo de cambio cambiaría (preview) SIN guardarlo.
// Se usa en modo manual para que el admin vea el valor automático actual.
public function previewTipoCambio(TipoCambioService $service)
{
    try {
        $tc = $service->calcular();

        return response()->json([
            'success' => true,
            'compra'  => $tc['compra'],
            'venta'   => $tc['venta'],
        ]);
    } catch (\Exception $e) {
        Log::error("Preview tipo de cambio error: " . $e->getMessage());
        return response()->json([
            'success' => false,
            'error'   => $e->getMessage(),
        ], 500);
    }
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

   public function actualizarTipoCambioAutomatico(TipoCambioService $service)
{
    try {
        $tc = $service->calcular();

        // Modo manual → tipo de cambio fijo: no se guarda, solo se informa
        // a qué valor cambiaría si el modo automático estuviera activo.
        if (!Configuracion::get('modo_automatico', true)) {
            $ultimo = TipoCambio::orderByDesc('id')->first();

            return response()->json([
                'success'         => true,
                'modo_automatico' => false,
                'tipoCambio'      => $ultimo,
                'compra_final'    => $tc['compra'],
                'venta_final'     => $tc['venta'],
                'mensaje'         => 'Modo manual: tipo de cambio fijo, no se guardó.',
            ]);
        }

        $tipoCambio = TipoCambio::create([
            'compra'              => $tc['compra'],
            'venta'               => $tc['venta'],
            'fecha_actualizacion' => now(),
        ]);

        return response()->json([
            'success'         => true,
            'modo_automatico' => true,
            'tipoCambio'      => $tipoCambio,
            'pen_buy'         => $tc['pen_buy'],
            'pen_sell'        => $tc['pen_sell'],
            'bob_buy'         => $tc['bob_buy'],
            'bob_sell'        => $tc['bob_sell'],
            'compra_base'     => $tc['compra_base'],
            'venta_base'      => $tc['venta_base'],
            'compra_final'    => $tc['compra'],
            'venta_final'     => $tc['venta'],
        ]);

    } catch (\Exception $e) {
        Log::error("Error actualizando tipo de cambio: " . $e->getMessage());

        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}




}
