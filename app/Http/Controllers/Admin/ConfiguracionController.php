<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Configuracion;
use Inertia\Inertia;

class ConfiguracionController extends Controller
{
    public function index()
    {
        $items = Configuracion::where('grupo', '!=', 'tipo_cambio')
            ->orderBy('grupo')
            ->orderBy('id')
            ->get(['id', 'clave', 'valor', 'tipo', 'etiqueta', 'descripcion', 'grupo']);

        return Inertia::render('Admin/Configuracion', [
            'configuracion' => $items,
        ]);
    }

    public function update(Request $request)
    {
        $items = Configuracion::where('grupo', '!=', 'tipo_cambio')->get(['clave', 'tipo']);

        $rules = [];
        foreach ($items as $item) {
            $rule = 'required';
            $rule .= match ($item->tipo) {
                'decimal', 'entero' => '|numeric|min:0',
                'booleano'          => '|boolean',
                default             => '|string|max:500',
            };
            $rules[$item->clave] = $rule;
        }

        $data = $request->validate($rules);

        foreach ($data as $clave => $valor) {
            Configuracion::set($clave, $valor);
        }

        return response()->json(['success' => true]);
    }
}
