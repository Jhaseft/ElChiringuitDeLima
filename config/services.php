<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
    'client_id'     => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect'      => env('GOOGLE_REDIRECT_URI'),
    ],

    'telegram' => [
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),
    'webhook_secret' => env('TELEGRAM_WEBHOOK_SECRET'),
    'allowed_ids' => env('TELEGRAM_ALLOWED_IDS', ''), // CSV
    ],

    'kyc' => [
        'key' => env('KYC_API_KEY'),
        'url' => env('KYC_BASE_URL'),
    ],

    'evolution' => [
        'server'   => env('EVOLUTION_SERVER'),
        'instance' => env('EVOLUTION_INSTANCE'),
        'apikey'   => env('EVOLUTION_APIKEY'),
        'numbers'  => env('EVOLUTION_NUMBERS', ''), // CSV de números
    ],

    'n8n' => [
        'chat_webhook' => env('N8N_CHAT_WEBHOOK'),
    ],

    'chatwoot' => [
        // Ej: https://app.chatwoot.com  (o la URL de tu instalación self-hosted)
        'base_url'   => env('CHATWOOT_BASE_URL'),
        'account_id' => env('CHATWOOT_ACCOUNT_ID'),
        'inbox_id'   => env('CHATWOOT_INBOX_ID'),
        // Perfil → Configuración del perfil → Token de acceso
        'api_token'  => env('CHATWOOT_API_TOKEN'),
        'enabled'    => env('CHATWOOT_ENABLED', false),
    ],

];
