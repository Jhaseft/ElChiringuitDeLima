<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppNative;
use App\Http\Controllers\OperacionController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\MobileFaceController;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\KycController;
use App\Http\Controllers\VersionGuardController;

// Registro y verificación
Route::post('/register', [AppNative::class, 'register']);
Route::post('/verify-code', [AppNative::class, 'verifyCode']);

// Login 
Route::post('/loginapp', [AppNative::class, 'login']);

//Para Google
Route::post('/logingoogle', [AppNative::class, 'loginGoogle']);

// Rutas protegidas con token Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AppNative::class, 'logout']);
    Route::get('/userapp', [AppNative::class, 'user']);
    Route::get('/listar-cuentas', [AppNative::class, 'listarCuentas']);
    Route::post('/operacion/guardar-cuenta', [OperacionController::class, 'guardarCuenta']);
    Route::post('/operacion/crear-transferencia', [OperacionController::class, 'crearTransferencia']);
    Route::get('/transfers/historymobile', [TransferController::class, 'historymobile']);
    Route::post('/complete-profile', [AppNative::class, 'completeProfile']);

    Route::post('/kyc/session', [KycController::class, 'createSession']);
});

Route::get('/version-minima',[VersionGuardController::class,'versionMinima']);

//para la web no para el movil xd
Route::post('/kyc/webhook', [KycController::class, 'webhook'])->name('kyc.webhook');