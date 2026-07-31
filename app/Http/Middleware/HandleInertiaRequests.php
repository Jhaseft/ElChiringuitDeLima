<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                // Sesión de chat estable por usuario (no adivinable): así su
                // conversación con el bot y en Chatwoot continúa entre logins.
                'chat_session' => $user
                    ? hash_hmac('sha256', 'chat-session:' . $user->id, config('app.key'))
                    : null,
            ],
        ];
    }
}
