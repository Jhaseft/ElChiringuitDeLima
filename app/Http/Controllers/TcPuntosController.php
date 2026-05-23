<?php

namespace App\Http\Controllers;

use App\Services\TcPuntosService;
use Illuminate\Http\Request;
 
class TcPuntosController extends Controller
{
    public function __construct(private TcPuntosService $service) {}

    public function saldo(Request $request)
    {
        return response()->json([
            'balance'     => $this->service->saldo($request->user()->id),
            'valor_punto' => $this->service->valorPunto(),
        ]);
    }

    public function historial(Request $request)
    {
        return response()->json(
            $this->service->historial($request->user()->id)
        );
    }

    public function catalogo()
    {
        return response()->json($this->service->catalogo());
    }

    public function canjear(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|integer|exists:tc_productos,id',
        ]);

        try {
            $resultado = $this->service->canjear(
                $request->user()->id,
                (int) $request->producto_id
            );

            return response()->json($resultado);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
