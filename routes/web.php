<?php
use App\Http\Controllers\AppNative;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FaceController; 
use App\Http\Controllers\CompleteProfileController;
use App\Http\Controllers\OperacionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\AdminTransfers;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminControllerDashboard;
use App\Http\Controllers\AdminUserMediaController;
use App\Http\Controllers\MobileFaceController;
use App\Http\Controllers\TransferController;
use App\Models\Bank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


// Página principal
Route::get('/', function () {
    $bancos = Bank::all();
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'bancos' => $bancos,
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

Route::get('/jaime', function () {

    return Inertia::render('jaime');

});
//Nosotros
Route::get('/nosotros', function () {

    return Inertia::render('Nosotros');

});
// Operaciones
Route::middleware(['web'])->group(function () {
    //listar bancos existentes en la abase de datos
    Route::get('/operacion/listar-bancos', [OperacionController::class, 'listarBancos'])->name('operacion.listarBancos');
    //guardar una cuenta
    Route::post('/operacion/guardar-cuenta', [OperacionController::class, 'guardarCuenta'])->name('operacion.guardarCuenta');
    //listar cuentas por usuario
    Route::get('/operacion/listar-cuentas/{user_id}', [OperacionController::class, 'listarCuentas'])->name('operacion.listarCuentas');
   //crear una tranferencia con automatizaciones de envio a Evolution y Email
    Route::post('/operacion/crear-transferencia', [OperacionController::class, 'crearTransferencia'])->name('operacion.crearTransferencia');
});

// Perfil y KYC
Route::middleware('auth')->group(function () {
    //completar perfil si viene de google
    Route::get('/complete-profile', [CompleteProfileController::class, 'index'])->name('complete-profile');
    Route::post('/complete-profile', [CompleteProfileController::class, 'store'])->name('complete-profile.store');
    //rutas para verificar el Kyc
    Route::get('/face', [FaceController::class, 'index'])->name('face.index');
    Route::post('/face/verify', [FaceController::class, 'verify'])->name('face.verify');
    //ver historial de tranferencias del usuario
    Route::get('/transfers/history', [TransferController::class, 'history'])->name('transfers.history');
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
        Route::get('/dashboard', [AdminControllerDashboard::class, 'index']);
        Route::post('/tipo-cambio', [AdminControllerDashboard::class, 'update']);
        
    Route::get('/users', [AdminUserMediaController::class, 'index']);
    Route::get('/users/{user}/detail', [AdminUserMediaController::class, 'show']);



    Route::get('/transfers', [AdminTransfers::class, 'index']);
    Route::get('/transfers/{id}', [AdminTransfers::class, 'show']);
    Route::post('/transfers', [AdminTransfers::class, 'store']);
    Route::put('/transfers/{id}', [AdminTransfers::class, 'update']);
    Route::delete('/transfers/{id}', [AdminTransfers::class, 'destroy']);

    
    });
});

//ruta oara proxy KYC
Route::post('/kyc-proxy', function (Request $request) {
    $user = $request->user(); // opcional, si quieres asociar a usuario logueado
    if (!$user) {
        return response()->json(['error' => 'No autenticado'], 401);
    }

    // Construir la petición al API externo
    $http = Http::withHeaders([
        'Accept' => 'application/json',
    ]);

    // Adjuntar archivos
    if ($request->hasFile('carnet')) {
        $http = $http->attach(
            'carnet', file_get_contents($request->file('carnet')->getRealPath()), 'documento_frente.jpg'
        );
    }

    if ($request->hasFile('carnet_back')) {
        $http = $http->attach(
            'carnet_back', file_get_contents($request->file('carnet_back')->getRealPath()), 'documento_reverso.jpg'
        );
    }

    if ($request->hasFile('video')) {
        $http = $http->attach(
            'video', file_get_contents($request->file('video')->getRealPath()), 'video.mp4'
        );
    }

    // Otros campos
    $params = [
        'doc_type' => $request->input('doc_type'),
    ];

    // Hacer POST al API externo
    $response = $http->post('https://api-face-api-face.ylblfg.easypanel.host/registro-face/verify', $params);

    return response($response->body(), $response->status())
        ->header('Content-Type', $response->header('Content-Type'));
});
 

// Tipo de cambio - API pública
Route::get('/api/tipo-cambio/historial', [AdminControllerDashboard::class, 'historial']);


/////////////////////////MOBILE///////////////////////////////////////
// Ruta temporal para mobile (genera token y redirige)
Route::get('/kyc-temporal/{userId}', function ($userId) {
    $token = bin2hex(random_bytes(16));
    Cache::put("kyc_temp_$token", $userId, 300); // 5 minutos

    $kycUrl = url('/mobile-face-view') . '?next=app://kyc-success&temp_token=' . $token;
    return redirect($kycUrl);
});

// Vista mobile KYC
Route::get('/mobile-face-view', [MobileFaceController::class, 'viewMobileKyc']);
Route::post('/mobile-face-verify', [MobileFaceController::class, 'verify']);

// Nueva ruta proxy KYC solo para mobile (sin validación de usuario)
Route::post('/kyc-proxy-mobile', function (Request $request) {

    $http = Http::withHeaders(['Accept' => 'application/json']);

    if ($request->hasFile('carnet')) {
        $http = $http->attach('carnet', file_get_contents($request->file('carnet')->getRealPath()), 'documento_frente.jpg');
    }
    if ($request->hasFile('carnet_back')) {
        $http = $http->attach('carnet_back', file_get_contents($request->file('carnet_back')->getRealPath()), 'documento_reverso.jpg');
    }
    if ($request->hasFile('video')) {
        $http = $http->attach('video', file_get_contents($request->file('video')->getRealPath()), 'video.mp4');
    }

    $params = ['doc_type' => $request->input('doc_type')];
    $response = $http->post('https://api-face-api-face.ylblfg.easypanel.host/registro-face/verify', $params);

    return response($response->body(), $response->status())
        ->header('Content-Type', $response->header('Content-Type'));
});


require __DIR__.'/auth.php';
