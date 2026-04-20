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
use App\Http\Controllers\Admin\AdminUserMediaController;
use App\Http\Controllers\Admin\TransferMethodController;
use App\Http\Controllers\TransferController;
use App\Models\Bank;
use App\Models\TransferMethod;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\KycController;

// Página principal
Route::get('/', function () {
    $bancos = Bank::all();
    $tc = \App\Models\TipoCambio::latest()->first();
    $transferMethods= TransferMethod::all();

    return Inertia::render('Welcome', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
        'bancos'      => $bancos,
        'TrMethods'   => $transferMethods,
        'tasas'       => $tc ? ['compra' => (float)$tc->compra, 'venta' => (float)$tc->venta] : null,
        'transferConfig' => [
            'min_pen'       => config('transfercash.min_pen'),
            'min_bob'       => config('transfercash.min_bob'),
            'kyc_limit_pen' => config('transfercash.kyc_limit_pen'),
            'kyc_limit_bob' => config('transfercash.kyc_limit_bob'),
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
Route::middleware(['web'])->group(function () {
    //listar bancos existentes en la abase de datos
    Route::get('/operacion/listar-bancos', [OperacionController::class, 'listarBancos'])->name('operacion.listarBancos');
    //crear cuentas de QR  y Tranferencia bancaria 
    Route::get('/operacion/listar-cuentas/{user_id}/{method_type}',[OperacionController::class, 'listarCuentas'])->name('operacion.listarCuentas');
      //guardar una cuenta
    Route::post('/operacion/guardar-cuenta', [OperacionController::class, 'guardarCuenta'])->name('operacion.guardarCuenta');
   //crear una tranferencia con automatizaciones de envio a Evolution y Email
    Route::post('/operacion/crear-transferencia', [OperacionController::class, 'crearTransferencia'])->name('operacion.crearTransferencia');
});
 
// Perfil y KYC
Route::middleware('auth')->group(function () {
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

// -------------------- REGISTRO PROVISIONAL Y ENVÍO DE EMAIL -------------------- //

Route::post('/register-provisional', [RegisteredUserController::class, 'store']);

// Ruta que crea el usuario después de verificar
Route::get('/verify-email/{token}', function ($token) {
    $data = Cache::get('register:' . $token);

    if (!$data) {
        return 'El enlace ha expirado o es inválido.';
    }

    $user = \App\Models\User::create([
        'first_name' => $data['first_name'],
        'last_name' => $data['last_name'],
        'email' => $data['email'],
        'phone' => $data['phone'] ?? null,
        'nationality' => $data['nationality'] ?? null,
        'document_number' => $data['document_number'] ?? null,
        'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
        'accepted_terms_at' => now(),          // momento de aceptación
        
    ]);

    Cache::forget('register:' . $token);

    \Illuminate\Support\Facades\Auth::login($user);

    return redirect('/')->with('success', 'Cuenta verificada y creada correctamente!');
})->name('email.verify');

Route::prefix('admin')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'showLoginForm'])->name('admin.login');
    Route::post('/login', [AdminAuthController::class, 'login'])->name('admin.login.post');
    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

    Route::middleware('auth:admin')->group(function () {

        //primera pantalla
        Route::get('/dashboard', [AdminControllerDashboard::class, 'Dashboard']);
        //segunda pantalla
        Route::get('/dashboard/tipo-cambio', [AdminControllerDashboard::class, 'tipoCambio']);
        
        //tercera pantalla
        Route::get('/dashboard/usuarios', [AdminUserMediaController::class, 'index']);
        //cuarta pantalla
        Route::get('/dashboard/transferencias', [AdminTransfers::class, 'index']);

        //quinta pantalla
        Route::get('/dashboard/efectivo', [AdminTransfersEfectivo::class, 'index']);

         //sexta pantalla
        Route::get('/dashboard/metodos', [TransferMethodController::class, 'index']);
        Route::post('/dashboard/metodos/store', [TransferMethodController::class, 'store']);
        Route::post('/dashboard/metodos/{id}/update', [TransferMethodController::class, 'update']);
        Route::delete('/dashboard/metodos/{id}', [TransferMethodController::class, 'destroy']);

        
        //septima pantalla
        Route::get('/dashboard/reportes', [ReportesController::class, 'index']);



        //tipo de cambio
        Route::post('/tipo-cambio', [AdminControllerDashboard::class, 'update']);
         
        //metodos de pago


        //usuarios
        Route::get('/users/{user}/detail/info', [AdminUserMediaController::class, 'showUsers']);
        Route::get('/users/{user}/detail/accounts', [AdminUserMediaController::class, 'showAccounts']);

 
        //ver tranferencia especifica de usuario
        Route::get('/transfers/user/{id}', [AdminTransfers::class, 'showUser']);
         Route::get('/transfers/detail/{id}', [AdminTransfers::class, 'transferDetail']);
        //actualizar transferemcia
        Route::put('/transfers/{id}', [AdminTransfers::class, 'update']);
        //elimianr tranferencia
        Route::delete('/transfers/{id}', [AdminTransfers::class, 'destroy']);

    
    });
});

// Métodos de transferencia - API pública (web + app móvil)
Route::get('/api/transfer-methods', function () {
    $methods = \App\Models\TransferMethod::all()
        ->groupBy('currency_pair')
        ->map(fn($group) => $group->values());
    return response()->json($methods);
});

// Tipo de cambio - API pública
Route::get('/api/tipo-cambio/historial', [AdminControllerDashboard::class, 'historial']);

// Tipo de cambio - API pública
Route::get('/api/tipo-cambio/compra', [AdminControllerDashboard::class, 'actualizarTipoCambioAutomatico']);

// Configuración de límites y mínimos - API pública para app móvil
Route::get('/api/config/transfer', function () {
    return response()->json([
        'min_pen'       => config('transfercash.min_pen'),
        'min_bob'       => config('transfercash.min_bob'),
        'kyc_limit_pen' => config('transfercash.kyc_limit_pen'),
        'kyc_limit_bob' => config('transfercash.kyc_limit_bob'),
    ]);
});

require __DIR__.'/auth.php';
