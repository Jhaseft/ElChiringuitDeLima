<?php

namespace App\Console\Commands;

use App\Services\ChatwootMirror;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportN8nChatToChatwoot extends Command
{
    protected $signature = 'chatwoot:import-n8n
        {--table=n8n_chat_histories : Tabla de historial de n8n}
        {--limit=0 : Máximo de sesiones a importar (0 = todas)}
        {--dry-run : Solo muestra qué haría, sin enviar a Chatwoot}';

    protected $description = 'Importa el histórico de conversaciones de n8n (Postgres) hacia Chatwoot';

    public function handle(ChatwootMirror $mirror): int
    {
        $table  = $this->option('table');
        $limit  = (int) $this->option('limit');
        $dryRun = (bool) $this->option('dry-run');

        if (! $dryRun && ! $mirror->isEnabled()) {
            $this->error('Chatwoot no está configurado/activado (revisa CHATWOOT_* en .env).');

            return self::FAILURE;
        }

        $conn = DB::connection('n8n_pg');

        $sessions = $conn->table($table)
            ->select('session_id')
            ->groupBy('session_id')
            ->orderByRaw('MIN(id)')
            ->pluck('session_id');

        if ($limit > 0) {
            $sessions = $sessions->take($limit);
        }

        $this->info("Sesiones a procesar: {$sessions->count()}" . ($dryRun ? '  (DRY-RUN)' : ''));

        $stats = ['imported' => 0, 'skipped' => 0, 'failed' => 0, 'empty' => 0, 'messages' => 0];
        $bar = $this->output->createProgressBar($sessions->count());
        $bar->start();

        foreach ($sessions as $sessionId) {
            $rows = $conn->table($table)
                ->where('session_id', $sessionId)
                ->orderBy('id')
                ->pluck('message');

            $lines = $this->buildLines($rows);
            $stats['messages'] += count($lines);

            if (empty($lines)) {
                $stats['empty']++;
                $bar->advance();
                continue;
            }

            if ($dryRun) {
                $stats['imported']++;
                $bar->advance();
                continue;
            }

            $status = $mirror->importConversation($sessionId, [
                'id'    => null,
                'name'  => null,
                'email' => null,
            ], $lines);

            $stats[$status] = ($stats[$status] ?? 0) + 1;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Importadas', 'Omitidas (ya existían)', 'Fallidas', 'Vacías', 'Mensajes'],
            [[$stats['imported'], $stats['skipped'], $stats['failed'], $stats['empty'], $stats['messages']]]
        );

        return self::SUCCESS;
    }

    /**
     * Convierte las filas jsonb de n8n en líneas limpias para Chatwoot:
     * human -> incoming, ai real -> outgoing. Descarta tool y stubs de tool-calls.
     *
     * @return list<array{role:string,content:string}>
     */
    private function buildLines($rows): array
    {
        $lines = [];

        foreach ($rows as $raw) {
            $m = is_string($raw) ? json_decode($raw, true) : (array) $raw;
            if (! is_array($m)) {
                continue;
            }

            $type    = $m['type'] ?? '';
            $content = trim((string) ($m['content'] ?? ''));

            if ($type === 'human' && $content !== '') {
                $lines[] = ['role' => 'incoming', 'content' => $content];
            } elseif ($type === 'ai' && empty($m['tool_calls']) && $content !== '') {
                $lines[] = ['role' => 'outgoing', 'content' => $content];
            }
            // 'tool' y stubs de ai con tool_calls se ignoran.
        }

        return $lines;
    }
}
