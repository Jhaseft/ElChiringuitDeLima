<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TasaController extends Controller
{
    public function getExchangeRate()
    {
        $apiKey = env('CURRENCY_API_KEY');
        $baseUrl = "https://api.currencyapi.com/v3/latest";

        $response = Http::get($baseUrl, [
            'apikey' => $apiKey,
            'base_currency' => 'PEN', // Sol peruano
            'currencies' => 'BOB'     // Boliviano
        ]);

        return $response->json();
    }
}
