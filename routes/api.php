<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppNative;
use App\Http\Controllers\OperacionController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\MobileFaceController;
use Illuminate\Support\Facades\Cache;
// Registro y verificación
Route::post('/register', [AppNative::class, 'register']);
Route::post('/verify-code', [AppNative::class, 'verifyCode']);

// Login
Route::post('/loginapp', [AppNative::class, 'login']);

// Rutas protegidas con token Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AppNative::class, 'logout']);
    Route::get('/userapp', [AppNative::class, 'user']);
    Route::get('/listar-cuentas', [AppNative::class, 'listarCuentas']);
    Route::post('/operacion/guardar-cuenta', [OperacionController::class, 'guardarCuenta']);
    Route::post('/operacion/crear-transferencia', [OperacionController::class, 'crearTransferencia']);
    Route::get('/transfers/historymobile', [TransferController::class, 'historymobile']);

});

Route::get('/kyc-temporal/{userId}', function ($userId) {
    $token = bin2hex(random_bytes(16)); // token aleatorio temporal
    Cache::put("kyc_temp_$token", $userId, 300); // válido 5 min

    $kycUrl = url('/mobile-face-view') . '?next=app://kyc-success&temp_token=' . $token;
    return redirect($kycUrl);
});
