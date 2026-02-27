<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" translate="no">
<head>
    <!-- Básico -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Título SEO -->
    <title inertia>
        Transfer Cash | Cambios rápidos y seguros
    </title>

    <!-- Meta description -->
    <meta name="description" content="Transfer Cash ofrece servicios de cambio de divisas rápidos, seguros y confiables. Realiza tus transferencias con total confianza y respaldo profesional." />

    <!-- Canonical -->
    <link rel="canonical" href="{{ url()->current() }}" />

    <!-- Nombre del sitio -->
    <meta name="application-name" content="Transfer Cash">
    <meta property="og:site_name" content="Transfer Cash">

    <!-- Google Site Verification -->
    <meta name="google-site-verification" content="JGBk5-plFEmsYV6WCUlGXRr9PhHxwk_NCXsH7hsOsyE" />

    <!-- ===========================
         Favicons
         =========================== -->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/logo.jpg') }}">
    <link rel="icon" type="image/png" sizes="48x48" href="{{ asset('images/logo.jpg') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/logo.jpg') }}">

    <!-- ===========================
         Open Graph (Facebook / WhatsApp)
         =========================== -->
    <meta property="og:title" content="Transfer Cash | Cambios rápidos y seguros">
    <meta property="og:description" content="Servicio confiable de cambio de divisas y transferencias rápidas con total seguridad.">
    <meta property="og:image" content="{{ asset('images/logo.jpg') }}">
    <meta property="og:url" content="{{ url('/') }}">
    <meta property="og:type" content="website">

    <!-- ===========================
         Twitter
         =========================== -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Transfer Cash">
    <meta name="twitter:description" content="Cambios rápidos y seguros con respaldo profesional.">
    <meta name="twitter:image" content="{{ asset('images/logo.jpg') }}">

    <!-- ===========================
         Datos estructurados (Schema.org)
         =========================== -->
    @verbatim
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FinancialService",
      "name": "Transfer Cash",
      "url": "https://transfercash.click",
      "logo": "https://https://transfercash.click/images/logo.jpg",
      "description": "Servicios de cambio de divisas y transferencias seguras.",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BO"
      }
    }
    </script>
    @endverbatim

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Laravel + Inertia + React -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>
</html>