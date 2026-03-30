<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Configuración de Transferencias
    |--------------------------------------------------------------------------
    | Editar los valores directamente en el .env sin tocar código.
    */

    'min_pen'           => (float) env('TRANSFER_MIN_PEN', 20),
    'min_bob'           => (float) env('TRANSFER_MIN_BOB', 60),
    'kyc_limit_pen'     => (float) env('TRANSFER_KYC_LIMIT_PEN', 300),
    'kyc_limit_bob'     => (float) env('TRANSFER_KYC_LIMIT_BOB', 1000),
    'margen'        => (float) env('TRANSFER_MARGEN', 0.01),
    'pips_compra'   => (float) env('TRANSFER_PIPS_COMPRA', 0.04),
    'pips_venta'    => (float) env('TRANSFER_PIPS_VENTA', -0.01),

];
