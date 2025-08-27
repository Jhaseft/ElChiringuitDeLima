<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FaceController; 
use App\Http\Controllers\CompleteProfileController;
use App\Models\Bank;
use App\Http\Controllers\OperacionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $bancos = Bank::all();
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
         'bancos' => $bancos,
    ]);
})->name('welcome');
//
Route::middleware(['web'])->group(function () {
    Route::get('/operacion/listar-bancos', [OperacionController::class, 'listarBancos'])->name('operacion.listarBancos');

    Route::post('/operacion/guardar-cuenta', [OperacionController::class, 'guardarCuenta'])->name('operacion.guardarCuenta');
    Route::get('/operacion/listar-cuentas/{user_id}', [OperacionController::class, 'listarCuentas'])->name('operacion.listarCuentas');
    Route::delete('/operacion/eliminar-cuenta/{id}', [OperacionController::class, 'eliminarCuenta'])->name('operacion.eliminarCuenta');

    Route::post('/operacion/crear-transferencia', [OperacionController::class, 'crearTransferencia'])->name('operacion.crearTransferencia');
});

Route::middleware('auth')->group(function () {
    //---------------------------Completar perfil para los de googel----------------------------//
    //recibe info
    Route::get('/complete-profile', [CompleteProfileController::class, 'index'])->name('complete-profile');
    //procesa la info y lo mete al usuario a la bd
    Route::post('/complete-profile', [CompleteProfileController::class, 'store'])->name('complete-profile.store');
    //----------------------------Llamada al KYC----------------//
  Route::get('/face', [FaceController::class, 'index'])->name('face.index'); // muestra Inertia page
    Route::post('/face/verify', [FaceController::class, 'verify'])->name('face.verify'); // recibe resultado y actualiza DB
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



// -------------------- LOGIN GOOGLE -------------------- //
Route::get('/auth/redirect', [AuthController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback'])->name('google.callback');

require __DIR__.'/auth.php';
