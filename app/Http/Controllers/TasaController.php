<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TasaController extends Controller
{
   public function getBolivia() {
    $token = env('BCP_PUBLIC_TOKEN');
    $response = Http::withHeaders([
        'Content-Type' => 'application/json; charset=utf-8'
    ])->post('https://api.banco.com/api/Bcp/ExchangeRate', [
        'country' => '840',
        'publicToken' => $token
    ]);

    return $response->json();
}
}
