<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" translate="no">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title inertia>{{ config('app.name') }}</title>
         <!-- Favicon personalizado -->
        <link rel="icon" href="{{ asset('/images/logo.jpg') }}" type="image/png">

        <!-- ===========================
             Meta Open Graph para redes sociales
             =========================== -->
        <meta property="og:title" content="Transfer Cash" />
        <meta property="og:description" content="Cambios Rapidos Y seguros" />
        <meta property="og:image" content="{{ asset('/images/logo.jpg') }}" />
        <meta property="og:url" content="{{ url('/') }}" />
        <meta property="og:type" content="website" />

        <!-- ===========================
             Meta para Twitter
             =========================== -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Transfer Cash" />
        <meta name="twitter:description" content="Cambios Rapidos Y seguros" />
        <meta name="twitter:image" content="{{ asset('/images/logo.jpg') }}" />
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
