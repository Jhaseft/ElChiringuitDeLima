<?php

namespace App\Jobs;

use App\Models\Transfer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Avisa por WhatsApp (Evolution API) de una nueva transferencia, por detrás.
// Antes se hacía dentro del request (HTTP con timeout de 10 s por número), lo que
// hacía lenta la creación de la operación bajo carga.
class EnviarWhatsappTransferencia implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public int $transferId) {}

    public function handle(): void
    {
        $transfer = Transfer::with([
            'user',
            'paymentMethod',
            'originAccount.bank',
            'destinationAccount.bank',
            'destinationAccount.owner',
        ])->find($this->transferId);

        if (!$transfer) {
            return;
        }

        $server   = config('services.evolution.server',   env('EVOLUTION_SERVER'));
        $instance = config('services.evolution.instance', env('EVOLUTION_INSTANCE'));
        $apikey   = config('services.evolution.apikey',   env('EVOLUTION_APIKEY'));
        $numerosRaw = config('services.evolution.numbers', env('EVOLUTION_NUMBERS', ''));

        if (!($server && $instance && $apikey && $numerosRaw)) {
            Log::warning('⚠️ Evolution API no configurada. WhatsApp omitido.');
            return;
        }

        $user           = $transfer->user;
        $paymentMethod  = $transfer->paymentMethod;
        $paymentSlug    = $paymentMethod?->slug ?? 'bank_transfer';
        $modo           = $transfer->modo;
        $transferNumber = 'OP-' . str_pad($transfer->id, 5, '0', STR_PAD_LEFT);
        $fecha          = $transfer->created_at->format('d/m/Y H:i');
        $convertedAmount = $transfer->converted_amount;
        $depositCurrency = $modo === 'PENtoBOB' ? 'PEN' : 'BOB';
        $receiveCurrency = $modo === 'PENtoBOB' ? 'BOB' : 'PEN';

        $mensaje  = "📌 *Nueva transferencia registrada*\n\n";
        $mensaje .= "📝 *Detalles de la operación*\n";
        $mensaje .= "• Número de operación: {$transferNumber}\n";
        $mensaje .= "• Fecha: {$fecha}\n";
        $mensaje .= "• Método de pago: " . ($paymentMethod?->name ?? ucfirst($paymentSlug)) . "\n";
        $mensaje .= "• Tipo de cambio aplicado: {$transfer->exchange_rate}\n\n";

        $mensaje .= "💳 *Pago del cliente*\n";
        $mensaje .= "• Monto: " . number_format($transfer->amount, 2) . " {$depositCurrency}\n";

        if ($modo === 'PENtoBOB') {
            $mensaje .= "• Método: Transferencia bancaria PE\n";
            if ($transfer->originAccount?->bank) {
                $mensaje .= "• Banco origen: {$transfer->originAccount->bank->name}\n";
                $mensaje .= "• Número de cuenta origen: {$transfer->originAccount->account_number}\n";
            }
        } else {
            if ($paymentSlug === 'cash') {
                $mensaje .= "• Método: Efectivo en oficina (BOB)\n";
                $mensaje .= "• El cliente debe haber pagado en oficina.\n";
            } elseif ($paymentSlug === 'qr') {
                $mensaje .= "• Método: QR de la empresa (BOB)\n";
                $mensaje .= "• El cliente escaneó nuestro QR de Bolivia para pagar.\n";
                if ($transfer->originAccount?->bank) {
                    $mensaje .= "• Banco origen (BO): {$transfer->originAccount->bank->name}\n";
                    $mensaje .= "• Número de cuenta origen: {$transfer->originAccount->account_number}\n";
                }
            }
        }
        $mensaje .= "\n";

        $mensaje .= "👤 *Cliente*\n";
        $mensaje .= "• Nombre: {$user->first_name} {$user->last_name}\n";
        $mensaje .= "• Email: {$user->email}\n";
        $mensaje .= "• Teléfono: " . ($user->phone ?? 'N/D') . "\n";
        $mensaje .= "• Nacionalidad: " . ucfirst($user->nationality ?? 'N/D') . "\n";
        $mensaje .= "• Documento: " . ($user->document_number ?? 'N/D') . "\n\n";

        $mensaje .= "📤 *Entrega al cliente*\n";
        $mensaje .= "• Monto: " . number_format($convertedAmount, 2) . " {$receiveCurrency}\n";

        if ($modo === 'BOBtoPEN') {
            $mensaje .= "• Método: Transferencia a cuenta PE del cliente\n";
            if ($transfer->destinationAccount?->bank) {
                $mensaje .= "• Banco destino: {$transfer->destinationAccount->bank->name}\n";
                $mensaje .= "• Número de cuenta destino: {$transfer->destinationAccount->account_number}\n";

                if ($transfer->destinationAccount->owner) {
                    $destOwner = $transfer->destinationAccount->owner;
                    $mensaje .= "\n👤 *Titular de la cuenta destino*\n";
                    $mensaje .= "• Nombre: " . ($destOwner->full_name ?? 'N/D') . "\n";
                    $mensaje .= "• Documento: " . ($destOwner->document_number ?? 'N/D') . "\n";
                    $mensaje .= "• Teléfono: " . ($destOwner->phone ?? 'N/D') . "\n";
                }
            }
        } else {
            if ($paymentSlug === 'cash') {
                $mensaje .= "• Método: Efectivo en oficina (BOB)\n";
                $mensaje .= "• Coordinar entrega del efectivo al cliente.\n";
            } elseif ($paymentSlug === 'qr') {
                $mensaje .= "• Método: QR del cliente (BOB)\n";
                if ($transfer->destinationAccount?->qr_value) {
                    $mensaje .= "• País QR destino: {$transfer->destinationAccount->qr_country}\n";
                    $mensaje .= "• URL QR destino: {$transfer->destinationAccount->qr_value}\n";
                }
            }
        }
        $mensaje .= "\n";
        $mensaje .= "📎 *Comprobante*: verificar en los Mails.\n\n";
        $mensaje .= "🔗 Ir al panel de administración:\n" . url('/admin/login');

        $numeros = array_filter(array_map('trim', explode(',', $numerosRaw)));

        foreach ($numeros as $numero) {
            $response = Http::timeout(10)->withHeaders([
                'Content-Type' => 'application/json',
                'apikey'       => $apikey,
            ])->post("$server/message/sendText/$instance", [
                'number' => $numero,
                'text'   => $mensaje,
            ]);

            if ($response->failed()) {
                Log::error("❌ Error enviando WhatsApp a {$numero}", [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
            }
        }
    }
}
