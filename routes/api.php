<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\AppNative;
use App\Http\Controllers\OperacionController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\KycController;
use App\Http\Controllers\VersionGuardController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\TcPuntosController;
use App\Http\Controllers\PushTokenController;

// Registro y verificación (rate limit para frenar fuerza bruta del código
// de 6 dígitos y del login por IP).
Route::middleware('ratelimit:5,1')->group(function () {
    Route::post('/register', [AppNative::class, 'register']);
    Route::post('/verify-code', [AppNative::class, 'verifyCode']);

    // Login
    Route::post('/loginapp', [AppNative::class, 'login']);

    //Para Google
    Route::post('/logingoogle', [AppNative::class, 'loginGoogle']);

    //Para Apple
    Route::post('/loginapple', [AppNative::class, 'loginApple']);
});

// Banners del home (público, solo lectura). Se administran desde el panel.
Route::get('/banners', function () {
    // Cache 24 h; se invalida via BannerObserver al editar en el panel.
    return Cache::remember('banners_activos', now()->addHours(24), function () {
        return \App\Models\Banner::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'image_url', 'sort_order']);
    });
});

// Rutas protegidas con token Sanctum. El límite GLOBAL (150 acciones/min por
// usuario, sumando todas las rutas) frena el abuso tipo "spam de refresh": al
// superarlo se bloquea TODA la app y el bloqueo escala (5→15→30→... min).
Route::middleware(['auth:sanctum', 'globalratelimit:100,1'])->group(function () {
    Route::post('/logout', [AppNative::class, 'logout']);
    Route::get('/userapp', [AppNative::class, 'user']);

    // Resumen del home: total operaciones, soles y bolivianos cambiados.
    Route::get('/operaciones/resumen', [OperacionController::class, 'resumen']);
    
    Route::get('/listar-cuentas', [AppNative::class, 'listarCuentas']);
 

    Route::post('/operacion/guardar-cuenta', [OperacionController::class, 'guardarCuenta']);
    Route::post('/operacion/crear-transferencia', [OperacionController::class, 'crearTransferencia'])->middleware('ratelimit:12,1');
    Route::get('/transfers/historymobile', [TransferController::class, 'historymobile']);
    Route::post('/complete-profile', [AppNative::class, 'completeProfile']);
     //eliminar cuenta
    Route::delete('/eliminar/{account_id}', [OperacionController::class, 'eliminarcuenta']);
    Route::post('/kyc/session', [KycController::class, 'createSession']);
    //RUTAS PARA LOS TC PUNTOS
 
    //conusultar saldo de usuario
    Route::get('/tc-puntos/saldo',     [TcPuntosController::class, 'saldo']);
    //historial de usuario
    Route::get('/tc-puntos/historial', [TcPuntosController::class, 'historial']);
    //catalogo de productos de tc puntos
    Route::get('/tc-puntos/catalogo',  [TcPuntosController::class, 'catalogo']);
    //post para canjear tc puntos
    Route::post('/tc-puntos/canjear',  [TcPuntosController::class, 'canjear']);

    Route::post('/push-tokens', [PushTokenController::class, 'store']);
    Route::delete('/push-tokens', [PushTokenController::class, 'destroy']);
});

Route::get('/version-minima',[VersionGuardController::class,'versionMinima']);

// Chat con asistente n8n (sin CSRF para app móvil)
Route::post('/chat/send', [ChatController::class, 'sendPhone'])->middleware('ratelimit:20,1');

//para la web no para el movil xd
Route::post('/kyc/webhook', [KycController::class, 'webhook'])->name('kyc.webhook');