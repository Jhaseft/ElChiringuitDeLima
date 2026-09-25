<?php

namespace App\Jobs;

use App\Models\TransactionReceipt;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

// Sube los comprobantes del cliente a Cloudinary por detrás (no bloquea el
// request de crear la transferencia). Idempotente: cada archivo se borra del
// disco temporal al subirse OK, así un reintento solo reprocesa los que faltaron.
class SubirComprobantesTransferencia implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 15;

    public function __construct(
        public int $transferId,
        public array $paths,
        public int $userId
    ) {}

    public function handle(): void
    {
        $disk = Storage::disk('local');

        foreach ($this->paths as $path) {
            if (!$disk->exists($path)) {
                continue; // ya subido en un intento anterior
            }

            $uploaded = (new UploadApi())->upload($disk->path($path), [
                'folder'        => 'transferencias/comprobantes/' . $this->userId,
                'resource_type' => 'auto',
            ]);

            TransactionReceipt::create([
                'transaction_id' => $this->transferId,
                'receipt_url'    => $uploaded['secure_url'],
                'receipt_type'   => 'client',
                'uploaded_by'    => $this->userId,
            ]);

            $disk->delete($path);
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('Fallo definitivo subiendo comprobantes', [
            'transfer_id' => $this->transferId,
            'error'       => $e->getMessage(),
        ]);
    }
}
