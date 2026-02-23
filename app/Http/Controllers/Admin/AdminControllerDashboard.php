<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TipoCambio;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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
  
    // Ver tipo de cambio
    public function usuarios(){
    return Inertia::render('Admin/Usuarios');
}


    // Ver tipo de cambio
    public function transferencias(){
    return Inertia::render('Admin/Transferencias');
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

    // Enviar mail a todos los usuarios
  $users = User::all();
foreach ($users as $user) {
    Mail::to($user->email)->send(new TipoCambioActualizadoMail($tipoCambio));
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
}
