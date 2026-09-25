<?php

namespace App\Services;

use App\Jobs\SendExpoPushNotification;

// Envío de notificaciones push. Ambos métodos DESPACHAN a la cola (Redis) para
// no bloquear el request; el Job hace el HTTP a Expo por detrás, con reintentos.
class ExpoPushService
{
    public function sendToUser(string $userId, string $title, string $body, array $data = []): void
    {
        SendExpoPushNotification::dispatch($title, $body, $data, $userId);
    }

    public function sendToAll(string $title, string $body, array $data = []): void
    {
        SendExpoPushNotification::dispatch($title, $body, $data);
    }
}
