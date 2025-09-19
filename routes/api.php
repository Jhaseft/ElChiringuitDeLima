<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppNative;

Route::post('/register', [AppNative::class, 'register']);
Route::post('/verify-code', [AppNative::class, 'verifyCode']);

// Rutas de login/logout/user si no las tienes
Route::post('/loginapp', [AppNative::class, 'login']);
Route::post('/logout', [AppNative::class, 'logout'])->middleware('auth:sanctum');
Route::get('/userapp', [AppNative::class, 'user'])->middleware('auth:sanctum');
