<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompleteProfileController;
use App\Http\Controllers\OperacionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Admin\AdminTransfers;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminControllerDashboard;
use App\Http\Controllers\Admin\ReportesController;
use App\Http\Controllers\Admin\AdminTransfersEfectivo;
use App\Http\Controllers\Admin\AdminTransfersQr;
use App\Http\Controllers\Admin\AdminUserMediaController;
use App\Http\Controllers\Admin\TransferMethodController;
use App\Http\Controllers\Admin\ConfiguracionController;
use App\Http\Controllers\Admin\AdminProductosTcController;
use App\Http\Controllers\Admin\AdminCanjesTcController;
use App\Http\Controllers\Admin\AdminNotificacionesController;
use App\Http\Controllers\Admin\AdminBannersController;
use App\Http\Controllers\Admin\AdminAccountsController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\ChatController;
use App\Models\Bank;
use App\Models\TransferMethod;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\KycController;
use App\Models\Configuracion;

// Página principal
Route::get('/', function () {
    $bancos = Bank::all();
    $tc = \App\Models\TipoCambio::latest()->first();
    $transferMethods = TransferMethod::all();

    return Inertia::render('Welcome', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
        'bancos'      => $bancos,
        'TrMethods'   => $transferMethods,
        'tasas'       => $tc ? ['compra' => (float)$tc->compra, 'venta' => (float)$tc->venta] : null,
        'transferConfig' => [
            'min_pen'       => Configuracion::get('transfer_min_pen', 0),
            'min_bob'       => Configuracion::get('transfer_min_bob', 0),
            'kyc_limit_pen' => Configuracion::get('transfer_kyc_limit_pen', 0),
            'kyc_limit_bob' => Configuracion::get('transfer_kyc_limit_bob', 0),
        ],
    ]);
})->name('welcome');

//contacto
Route::get('/contacto', function () {
    return Inertia::render('Contacto');
});
//politicas
Route::get('/politicas', function () {

    return Inertia::render('politicasypriv');
});

//politicasludo
Route::get('/PoliticasLudo', function () {

    return Inertia::render('Politicas');
});
//pasos ludo
Route::get('/PasosLudo', function () {

    return Inertia::render('Pasos');
});


//Nosotros
Route::get('/nosotros', function () {

    return Inertia::render('Nosotros');
});
//App Native
Route::get('/App', function () {

    return Inertia::render('AppNative');
});

// Operaciones
// Listar bancos es información pública (catálogo); el resto exige sesión
// porque opera sobre cuentas/transferencias del usuario autenticado.
Route::get('/operacion/listar-bancos', [OperacionController::class, 'listarBancos'])->name('operacion.listarBancos');

Route::middleware(['auth', 'notblocked'])->group(function () {
    //listar cuentas del usuario autenticado (el {user_id} se ignora por seguridad)
    Route::get('/operacion/listar-cuentas/{user_id}/{method_type}', [OperacionController::class, 'listarCuentas'])->name('operacion.listarCuentas');
    //guardar una cuenta
    Route::post('/operacion/guardar-cuenta', [OperacionController::class, 'guardarCuenta'])->name('operacion.guardarCuenta');
    //crear una tranferencia con automatizaciones de envio a Evolution y Email
    Route::post('/operacion/crear-transferencia', [OperacionController::class, 'crearTransferencia'])->middleware('ratelimit:12,1')->name('operacion.crearTransferencia');
});

// Perfil y KYC
Route::middleware(['auth', 'notblocked'])->group(function () {
    //completar perfil si viene de google
    Route::get('/complete-profile', [CompleteProfileController::class, 'index'])->name('complete-profile');
    Route::post('/complete-profile', [CompleteProfileController::class, 'store'])->name('complete-profile.store');
    //ver historial de tranferencias del usuario
    Route::get('/transfers/history', [TransferController::class, 'history'])->name('transfers.history');
    //eliminar cuenta
    Route::delete('/eliminar/{account_id}', [OperacionController::class, 'eliminarcuenta']);

    Route::post('/kyc/session', [KycController::class, 'createSession']);

    Route::get('/kyc/resultado', function () {
        return Inertia::render('KycResultado');
    });
});

// Login Google
Route::get('/auth/redirect', [AuthController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('google.callback');

// -------------------- REGISTRO POR CÓDIGO (web, igual que la app) -------------------- //

// Paso 1: enviar código de 6 dígitos al correo.
Route::post('/register-provisional', [RegisteredUserController::class, 'store'])->middleware('ratelimit:10,1');

// Paso 2: verificar el código, crear el usuario y dejarlo logueado.
Route::post('/register-provisional/verify', [RegisteredUserController::class, 'verifyCode'])->middleware('ratelimit:10,1');

Route::prefix('admin')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'showLoginForm'])->name('admin.login');
    // Rate limit estricto: es el login más sensible (acceso total al panel).
    // 5 intentos por minuto por IP para frenar fuerza bruta de credenciales admin.
    Route::post('/login', [AdminAuthController::class, 'login'])->name('admin.login.post')->middleware('ratelimit:5,1');
    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

    Route::middleware('auth:admin')->group(function () {

        // Inicio: accesible a cualquier admin logueado (pantalla de aterrizaje).
        Route::get('/dashboard', [AdminControllerDashboard::class, 'Dashboard']);

        // Tipo de Cambio
        Route::middleware('admin.can:tipo-cambio')->group(function () {
            Route::get('/dashboard/tipo-cambio', [AdminControllerDashboard::class, 'tipoCambio']);
            Route::post('/tipo-cambio', [AdminControllerDashboard::class, 'update']);
            Route::get('/tipo-cambio/preview', [AdminControllerDashboard::class, 'previewTipoCambio']);
        });

        // Notificaciones
        Route::middleware('admin.can:notificaciones')->group(function () {
            Route::get('/dashboard/notificaciones', [AdminNotificacionesController::class, 'index']);
            Route::post('/dashboard/notificaciones/send', [AdminNotificacionesController::class, 'send']);
        });

        // Transferencias
        Route::middleware('admin.can:transferencias')->group(function () {
            Route::get('/dashboard/transferencias', [AdminTransfers::class, 'index']);
            Route::get('/transfers/user/{id}', [AdminTransfers::class, 'showUser']);
            Route::get('/transfers/detail/{id}', [AdminTransfers::class, 'transferDetail']);
            Route::put('/transfers/{id}', [AdminTransfers::class, 'update']);
            Route::delete('/transfers/{id}', [AdminTransfers::class, 'destroy']);
        });

        // Efectivo
        Route::middleware('admin.can:efectivo')->group(function () {
            Route::get('/dashboard/efectivo', [AdminTransfersEfectivo::class, 'index']);
        });

        // QR
        Route::middleware('admin.can:qr')->group(function () {
            Route::get('/dashboard/qr', [AdminTransfersQr::class, 'index']);
        });

        // Metodos de Pago
        Route::middleware('admin.can:metodos')->group(function () {
            Route::get('/dashboard/metodos', [TransferMethodController::class, 'index']);
            Route::post('/dashboard/metodos/store', [TransferMethodController::class, 'store']);
            Route::post('/dashboard/metodos/{id}/update', [TransferMethodController::class, 'update']);
            Route::delete('/dashboard/metodos/{id}', [TransferMethodController::class, 'destroy']);
        });

        // Usuarios
        Route::middleware('admin.can:usuarios')->group(function () {
            Route::get('/dashboard/usuarios', [AdminUserMediaController::class, 'index']);
            Route::get('/users/{user}/detail/info', [AdminUserMediaController::class, 'showUsers']);
            Route::get('/users/{user}/detail/accounts', [AdminUserMediaController::class, 'showAccounts']);
            Route::post('/users/{user}/block', [AdminUserMediaController::class, 'block']);
            Route::post('/users/{user}/unblock', [AdminUserMediaController::class, 'unblock']);
        });

        // Reportes
        Route::middleware('admin.can:reportes')->group(function () {
            Route::get('/dashboard/reportes', [ReportesController::class, 'index']);
            Route::get('/dashboard/reportes/datos', [ReportesController::class, 'datos']);
            Route::get('/dashboard/reportes/excel', [ReportesController::class, 'exportarExcel']);
        });

        // Configuracion
        Route::middleware('admin.can:configuracion')->group(function () {
            Route::get('/dashboard/configuracion', [ConfiguracionController::class, 'index']);
            Route::post('/dashboard/configuracion', [ConfiguracionController::class, 'update']);
        });

        // Productos TC puntos
        Route::middleware('admin.can:productos-tc')->group(function () {
            Route::get('/dashboard/productos-tc', [AdminProductosTcController::class, 'index']);
            Route::post('/dashboard/productos-tc/categorias/store', [AdminProductosTcController::class, 'storeCategoria']);
            Route::post('/dashboard/productos-tc/categorias/{id}/update', [AdminProductosTcController::class, 'updateCategoria']);
            Route::delete('/dashboard/productos-tc/categorias/{id}', [AdminProductosTcController::class, 'destroyCategoria']);
            Route::post('/dashboard/productos-tc/productos/store', [AdminProductosTcController::class, 'storeProducto']);
            Route::post('/dashboard/productos-tc/productos/{id}/update', [AdminProductosTcController::class, 'updateProducto']);
            Route::delete('/dashboard/productos-tc/productos/{id}', [AdminProductosTcController::class, 'destroyProducto']);
        });

        // Canjes TC puntos
        Route::middleware('admin.can:canjes-tc')->group(function () {
            Route::get('/dashboard/canjes-tc', [AdminCanjesTcController::class, 'index']);
            Route::post('/dashboard/canjes-tc/{id}/status', [AdminCanjesTcController::class, 'updateStatus']);
        });

        // Banners del home
        Route::middleware('admin.can:banners')->group(function () {
            Route::get('/dashboard/banners', [AdminBannersController::class, 'index']);
            Route::post('/dashboard/banners/store', [AdminBannersController::class, 'store']);
            Route::post('/dashboard/banners/{id}/update', [AdminBannersController::class, 'update']);
            Route::delete('/dashboard/banners/{id}', [AdminBannersController::class, 'destroy']);
        });

        // Administradores y roles: solo roles con acceso total (is_super).
        Route::middleware('admin.can:administradores')->group(function () {
            Route::get('/dashboard/administradores', [AdminAccountsController::class, 'index']);
            Route::post('/dashboard/administradores/admins/store', [AdminAccountsController::class, 'storeAdmin']);
            Route::post('/dashboard/administradores/admins/{id}/update', [AdminAccountsController::class, 'updateAdmin']);
            Route::delete('/dashboard/administradores/admins/{id}', [AdminAccountsController::class, 'destroyAdmin']);
            Route::post('/dashboard/administradores/roles/store', [AdminAccountsController::class, 'storeRole']);
            Route::post('/dashboard/administradores/roles/{id}/update', [AdminAccountsController::class, 'updateRole']);
            Route::delete('/dashboard/administradores/roles/{id}', [AdminAccountsController::class, 'destroyRole']);
        });
    });
});

// Métodos de transferencia - API pública (web + app móvil)
Route::get('/api/transfer-methods', function () {
    // Cache 24 h; se invalida via TransferMethodObserver al editar en el panel.
    $methods = Cache::remember('transfer_methods', now()->addHours(24), function () {
        return \App\Models\TransferMethod::all()
            ->groupBy('currency_pair')
            ->map(fn($group) => $group->values());
    });
    return response()->json($methods);
});

// Tipo de cambio - API pública (solo lectura del historial)
Route::get('/api/tipo-cambio/historial', [AdminControllerDashboard::class, 'historial']);

// NOTA: la actualización automática del tipo de cambio la hace el scheduler
// (routes/console.php → 'tipo-cambio:actualizar' cada 5 min). NO se expone por
// HTTP: un endpoint público que escribía en BD y consultaba Binance en cada hit
// era abusable (DoS/costos/manipulación del TC).

// Chat con asistente (proxy a n8n)
Route::post('/chat/send', [ChatController::class, 'sendweb'])->middleware('ratelimit:20,1');


// Configuración de límites y mínimos - API pública para app móvil
Route::get('/api/config/transfer', function () {
    // Cache 24 h; se invalida en ConfiguracionController::update al guardar límites.
    $config = Cache::remember('config_transfer', now()->addHours(24), function () {
        return [
            'min_pen'       => Configuracion::get('transfer_min_pen', 0),
            'min_bob'       => Configuracion::get('transfer_min_bob', 0),
            'kyc_limit_pen' => Configuracion::get('transfer_kyc_limit_pen', 0),
            'kyc_limit_bob' => Configuracion::get('transfer_kyc_limit_bob', 0),
            'max_pen'       => Configuracion::get('transfer_max_pen', 0),
            'max_bob'       => Configuracion::get('transfer_max_bob', 0),
        ];
    });
    return response()->json($config);
});

require __DIR__ . '/auth.php';
