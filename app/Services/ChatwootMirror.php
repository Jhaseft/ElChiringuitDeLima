<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Espeja (copia) cada conversación del chat hacia Chatwoot para poder
 * revisar de qué hablan los usuarios y cómo, sin cambiar el flujo actual
 * (widget propio + bot n8n). No es bloqueante: cualquier error se registra
 * pero nunca rompe la respuesta al usuario.
 */
class ChatwootMirror
{
    /** Minutos que se recuerda el mapeo session_id -> conversación de Chatwoot. */
    private const MAP_TTL_MINUTES = 60 * 24; // 24 horas

    public function isEnabled(): bool
    {
        $c = config('services.chatwoot');

        return (bool) ($c['enabled'] ?? false)
            && filled($c['base_url'] ?? null)
            && filled($c['account_id'] ?? null)
            && filled($c['inbox_id'] ?? null)
            && filled($c['api_token'] ?? null);
    }

    /**
     * Envía a Chatwoot el mensaje del usuario (incoming) y la respuesta
     * del bot (outgoing), agrupados en una conversación por session_id.
     *
     * @param array{id?:mixed,name?:?string,email?:?string} $user
     */
    public function mirror(string $sessionId, array $user, string $userMessage, string $botReply): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        try {
            $conversationId = $this->ensureConversation($sessionId, $user);

            if (! $conversationId) {
                return;
            }

            $this->postMessage($conversationId, $userMessage, 'incoming');
            $this->postMessage($conversationId, $botReply, 'outgoing');
        } catch (\Throwable $e) {
            Log::warning('[Chatwoot] no se pudo espejar la conversación', [
                'session_id' => $sessionId,
                'error'      => $e->getMessage(),
            ]);
        }
    }

    /**
     * Importa una conversación histórica completa (varias líneas) en una sola
     * conversación de Chatwoot. Idempotente: si el contacto de esa sesión ya
     * tiene una conversación, la omite para no duplicar.
     *
     * @param array{id?:mixed,name?:?string,email?:?string} $user
     * @param list<array{role:string,content:string}>       $lines  role = incoming|outgoing
     * @return string  'imported' | 'skipped' | 'failed'
     */
    public function importConversation(string $sessionId, array $user, array $lines): string
    {
        if (! $this->isEnabled() || empty($lines)) {
            return 'failed';
        }

        [$contactId, $sourceId] = $this->resolveContact($sessionId, $user);
        if (! $sourceId) {
            return 'failed';
        }

        if ($contactId && $this->contactHasConversation($contactId)) {
            return 'skipped';
        }

        $res = $this->client()->post($this->url('/conversations'), [
            'source_id' => $sourceId,
            'inbox_id'  => (int) config('services.chatwoot.inbox_id'),
        ]);

        if (! $res->successful()) {
            Log::warning('[Chatwoot] fallo creando conversación (import)', [
                'session_id' => $sessionId,
                'status'     => $res->status(),
                'body'       => $res->body(),
            ]);

            return 'failed';
        }

        $conversationId = (int) data_get($res->json(), 'id');
        if ($conversationId <= 0) {
            return 'failed';
        }

        foreach ($lines as $line) {
            $this->postMessage($conversationId, $line['content'], $line['role']);
        }

        return 'imported';
    }

    /** Crea o busca el contacto y devuelve [contact_id, source_id]. */
    private function resolveContact(string $sessionId, array $user): array
    {
        $identifier = isset($user['id']) && $user['id'] !== null
            ? 'user-' . $user['id']
            : 'guest-' . $sessionId;

        $name = filled($user['name'] ?? null)
            ? $user['name']
            : 'Visitante ' . substr($sessionId, 0, 8);

        $res = $this->client()->post($this->url('/contacts'), array_filter([
            'inbox_id'   => (int) config('services.chatwoot.inbox_id'),
            'name'       => $name,
            'email'      => $user['email'] ?? null,
            'identifier' => $identifier,
        ], fn ($v) => $v !== null && $v !== ''));

        if ($res->status() === 422) {
            return $this->findContact($identifier);
        }

        if (! $res->successful()) {
            Log::warning('[Chatwoot] fallo creando contacto (import)', [
                'status' => $res->status(),
                'body'   => $res->body(),
            ]);

            return [null, null];
        }

        $body = $res->json();

        return [
            data_get($body, 'payload.contact.id'),
            $this->extractSourceId($body),
        ];
    }

    /** Busca un contacto por identifier y devuelve [contact_id, source_id]. */
    private function findContact(string $identifier): array
    {
        $res = $this->client()->get($this->url('/contacts/search'), ['q' => $identifier]);

        if (! $res->successful()) {
            return [null, null];
        }

        foreach ((array) data_get($res->json(), 'payload', []) as $contact) {
            if (data_get($contact, 'identifier') === $identifier) {
                return [
                    data_get($contact, 'id'),
                    (string) data_get($contact, 'contact_inboxes.0.source_id'),
                ];
            }
        }

        return [null, null];
    }

    private function contactHasConversation($contactId): bool
    {
        $res = $this->client()->get($this->url("/contacts/{$contactId}/conversations"));

        if (! $res->successful()) {
            return false;
        }

        return ! empty(data_get($res->json(), 'payload', []));
    }

    /** Devuelve el id de conversación de Chatwoot para esta sesión (creándola si hace falta). */
    private function ensureConversation(string $sessionId, array $user): ?int
    {
        $cacheKey = 'chatwoot:conv:' . $sessionId;

        $cached = Cache::get($cacheKey);
        if (is_int($cached)) {
            return $cached;
        }

        $sourceId = $this->ensureContact($sessionId, $user);
        if (! $sourceId) {
            return null;
        }

        $res = $this->client()->post($this->url('/conversations'), [
            'source_id'  => $sourceId,
            'inbox_id'   => (int) config('services.chatwoot.inbox_id'),
        ]);

        if (! $res->successful()) {
            Log::warning('[Chatwoot] fallo creando conversación', [
                'status' => $res->status(),
                'body'   => $res->body(),
            ]);

            return null;
        }

        $conversationId = (int) data_get($res->json(), 'id');
        if ($conversationId > 0) {
            Cache::put($cacheKey, $conversationId, now()->addMinutes(self::MAP_TTL_MINUTES));
        }

        return $conversationId ?: null;
    }

    /**
     * Crea/recupera el contacto en Chatwoot y devuelve su source_id
     * (necesario para abrir conversaciones vía API).
     */
    private function ensureContact(string $sessionId, array $user): ?string
    {
        $cacheKey = 'chatwoot:contact:' . $sessionId;

        $cached = Cache::get($cacheKey);
        if (is_string($cached) && $cached !== '') {
            return $cached;
        }

        $identifier = isset($user['id']) && $user['id'] !== null
            ? 'user-' . $user['id']
            : 'guest-' . $sessionId;

        $name = filled($user['name'] ?? null)
            ? $user['name']
            : 'Visitante ' . substr($sessionId, 0, 8);

        $res = $this->client()->post($this->url('/contacts'), array_filter([
            'inbox_id'     => (int) config('services.chatwoot.inbox_id'),
            'name'         => $name,
            'email'        => $user['email'] ?? null,
            'phone_number' => $this->normalizePhone($user['phone'] ?? null),
            'identifier'   => $identifier,
        ], fn ($v) => $v !== null && $v !== ''));

        // Si el contacto ya existía, Chatwoot responde 422; lo buscamos por identifier.
        if ($res->status() === 422) {
            $sourceId = $this->findContactSourceId($identifier);
            if ($sourceId) {
                Cache::put($cacheKey, $sourceId, now()->addMinutes(self::MAP_TTL_MINUTES));
            }

            return $sourceId;
        }

        if (! $res->successful()) {
            Log::warning('[Chatwoot] fallo creando contacto', [
                'status' => $res->status(),
                'body'   => $res->body(),
            ]);

            return null;
        }

        $sourceId = $this->extractSourceId($res->json());
        if ($sourceId) {
            Cache::put($cacheKey, $sourceId, now()->addMinutes(self::MAP_TTL_MINUTES));
        }

        return $sourceId;
    }

    private function findContactSourceId(string $identifier): ?string
    {
        $res = $this->client()->get($this->url('/contacts/search'), ['q' => $identifier]);

        if (! $res->successful()) {
            return null;
        }

        foreach ((array) data_get($res->json(), 'payload', []) as $contact) {
            if (data_get($contact, 'identifier') === $identifier) {
                $sid = data_get($contact, 'contact_inboxes.0.source_id');
                if ($sid) {
                    return (string) $sid;
                }
            }
        }

        return null;
    }

    /** El source_id puede venir en distintas rutas según la versión de Chatwoot. */
    private function extractSourceId(array $body): ?string
    {
        $sid = data_get($body, 'payload.contact_inbox.source_id')
            ?? data_get($body, 'payload.contact.contact_inboxes.0.source_id')
            ?? data_get($body, 'payload.contact_inboxes.0.source_id');

        return $sid ? (string) $sid : null;
    }

    /**
     * Chatwoot exige el teléfono en formato E.164 (con prefijo +). Solo lo
     * devolvemos si cumple; de lo contrario null, para no romper la creación
     * del contacto por un teléfono inválido.
     */
    private function normalizePhone(?string $phone): ?string
    {
        if (! filled($phone)) {
            return null;
        }

        $clean = preg_replace('/[\s\-().]/', '', trim($phone));

        return preg_match('/^\+\d{7,15}$/', $clean) ? $clean : null;
    }

    private function postMessage(int $conversationId, string $content, string $type): void
    {
        $content = trim($content);
        if ($content === '') {
            return;
        }

        $res = $this->client()->post(
            $this->url("/conversations/{$conversationId}/messages"),
            [
                'content'      => $content,
                'message_type' => $type, // incoming = usuario, outgoing = bot
            ]
        );

        if (! $res->successful()) {
            Log::warning('[Chatwoot] fallo enviando mensaje', [
                'conversation_id' => $conversationId,
                'type'            => $type,
                'status'          => $res->status(),
                'body'            => $res->body(),
            ]);
        }
    }

    private function client()
    {
        return Http::timeout(10)
            ->acceptJson()
            ->asJson()
            ->withHeaders(['api_access_token' => config('services.chatwoot.api_token')]);
    }

    private function url(string $path): string
    {
        $base = rtrim((string) config('services.chatwoot.base_url'), '/');
        $account = config('services.chatwoot.account_id');

        return "{$base}/api/v1/accounts/{$account}{$path}";
    }
}
