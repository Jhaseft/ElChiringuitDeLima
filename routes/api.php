<?php
use App\Http\Controllers\Operacion\OperacionController;

Route::prefix('operacion')->group(function() {
    Route::post('guardar-cuenta', [OperacionController::class,'guardarCuenta']);
    Route::get('listar-cuentas/{user_id}', [OperacionController::class,'listarCuentas']);
    Route::post('crear-transferencia', [OperacionController::class,'crearTransferencia']);
});