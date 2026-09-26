@extends('emails.layout', ['title' => 'Transferencia verificada'])

@section('content')
    @php
        $slug       = $paymentMethodSlug ?? 'bank_transfer';
        $methodName = $paymentMethodName ?? 'Transferencia Bancaria';
        $depCur     = $depositCurrency ?? '';
        $recCur     = $receiveCurrency ?? '';
        $th         = 'text-align:left; padding:10px 12px; background-color:#F9FAFB; border:1px solid #E5E7EB; color:#374151; font-weight:700; font-size:13px; width:45%;';
        $td         = 'padding:10px 12px; border:1px solid #E5E7EB; color:#111827; font-size:13px;';
        $h2         = 'margin:26px 0 12px 0; color:#111827; font-size:16px; font-weight:700;';
    @endphp

    <div style="display:inline-block; background-color:#DCFCE7; color:#16A34A; font-size:12px; font-weight:700; padding:6px 12px; border-radius:999px; margin-bottom:14px;">
        Operación verificada
    </div>

    <h1 style="margin:0 0 14px 0; color:#111827; font-size:26px; font-weight:800; line-height:1.25;">
        Tu transferencia ha sido realizada
    </h1>

    <p style="margin:0 0 8px 0; color:#374151; font-size:15px; line-height:1.6;">
        Confirmamos que tu operación fue procesada correctamente. Aquí tienes el detalle:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-top:12px;">
        <tr><td style="{{ $th }}">Método de pago</td><td style="{{ $td }}">{{ $methodName }}</td></tr>
        <tr><td style="{{ $th }}">Monto enviado</td><td style="{{ $td }}">{{ number_format($amount, 2) }} {{ $depCur }}</td></tr>
        <tr><td style="{{ $th }}">Monto convertido</td><td style="{{ $td }}">{{ number_format($converted_amount ?? 0, 2) }} {{ $recCur }}</td></tr>
        <tr><td style="{{ $th }}">Tipo de cambio</td><td style="{{ $td }}">{{ $exchange_rate ?? '-' }}</td></tr>
        <tr><td style="{{ $th }}">Modo de transferencia</td><td style="{{ $td }}">{{ $transfer->modo ?? '-' }}</td></tr>
    </table>

    @if($slug === 'cash')
        <h2 style="{{ $h2 }}">Entrega en efectivo</h2>
        <p style="margin:0; color:#374151; font-size:14px; line-height:1.6;">Tu operación con pago en efectivo ha sido completada. Si aún no has retirado el monto convertido, acércate a la oficina / punto autorizado con tu documento de identidad.</p>
    @elseif($slug === 'qr')
        <h2 style="{{ $h2 }}">Operación vía QR</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            @if($origin_account?->qr_value)
                <tr><td style="{{ $th }}">QR origen</td><td style="{{ $td }}">País {{ $origin_account->qr_country }}</td></tr>
            @endif
            @if($destination_account?->qr_value)
                <tr><td style="{{ $th }}">QR destino</td><td style="{{ $td }}">País {{ $destination_account->qr_country }}</td></tr>
            @endif
        </table>
    @else
        <h2 style="{{ $h2 }}">Cuentas involucradas</h2>
        @if($origin_account || $destination_account)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr><td style="{{ $th }}">Cuenta origen</td><td style="{{ $td }}">{{ $origin_account?->bank?->name ? $origin_account->bank->name.' — ' : '' }}{{ $origin_account?->account_number ?? 'N/A' }}</td></tr>
                <tr><td style="{{ $th }}">Cuenta destino</td><td style="{{ $td }}">{{ $destination_account?->bank?->name ? $destination_account->bank->name.' — ' : '' }}{{ $destination_account?->account_number ?? 'N/A' }}</td></tr>
            </table>
        @else
            <p style="margin:0; color:#6B7280; font-size:14px;">Información de cuentas no disponible.</p>
        @endif
    @endif

    @php
        $receiptsList = !empty($adminReceipts) ? $adminReceipts : (!empty($adminReceipt) ? [$adminReceipt] : []);
    @endphp

    @if(count($receiptsList) > 0)
        <h2 style="{{ $h2 }}">{{ count($receiptsList) > 1 ? 'Comprobantes aprobados' : 'Comprobante aprobado' }}</h2>
        <p style="margin:0 0 8px 0; color:#374151; font-size:14px; line-height:1.6;">
            {{ count($receiptsList) > 1 ? 'Puedes visualizar tus comprobantes oficiales aquí:' : 'Puedes visualizar tu comprobante oficial aquí:' }}
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top:8px;">
            @foreach($receiptsList as $idx => $url)
                @include('emails.partials.button', ['url' => $url, 'label' => 'Ver comprobante '.(count($receiptsList) > 1 ? ($idx + 1) : '')])
            @endforeach
        </td></tr></table>
    @endif

    <p style="margin:26px 0 0 0; color:#374151; font-size:14px; line-height:1.6;">
        Gracias por confiar en {{ config('app.name') }}.
    </p>
@endsection
