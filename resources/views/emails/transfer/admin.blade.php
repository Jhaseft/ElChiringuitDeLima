@extends('emails.layout', ['title' => 'Nueva transferencia registrada'])

@section('content')
    @php
        $slug       = $data['paymentMethodSlug'] ?? 'bank_transfer';
        $methodName = $data['paymentMethodName'] ?? 'Transferencia Bancaria';
        $origin     = $data['transfer']->originAccount ?? null;
        $dest       = $data['transfer']->destinationAccount ?? null;
        $destOwner  = $dest->owner ?? null;
        $th         = 'text-align:left; padding:10px 12px; background-color:#F9FAFB; border:1px solid #E5E7EB; color:#374151; font-weight:700; font-size:13px; width:45%;';
        $td         = 'padding:10px 12px; border:1px solid #E5E7EB; color:#111827; font-size:13px;';
        $h2         = 'margin:26px 0 12px 0; color:#111827; font-size:16px; font-weight:700;';
    @endphp

    <h1 style="margin:8px 0 14px 0; color:#111827; font-size:24px; font-weight:800; line-height:1.3;">
        Nueva transferencia registrada
    </h1>

    <h2 style="{{ $h2 }}">Detalles de la operación</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="{{ $th }}">Número de operación</td><td style="{{ $td }}">{{ $data['transferNumber'] }}</td></tr>
        <tr><td style="{{ $th }}">Fecha</td><td style="{{ $td }}">{{ $data['transfer']->created_at->format('d/m/Y H:i') }}</td></tr>
        <tr><td style="{{ $th }}">Método de pago</td><td style="{{ $td }}">{{ $methodName }}</td></tr>
        <tr><td style="{{ $th }}">Tipo de cambio</td><td style="{{ $td }}">{{ $data['transfer']->exchange_rate }}</td></tr>
    </table>

    @if($slug === 'cash')
        <h2 style="{{ $h2 }}">Depósito en efectivo</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="{{ $th }}">Monto a depositar</td><td style="{{ $td }}">{{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}</td></tr>
            <tr><td style="{{ $th }}">Entrega</td><td style="{{ $td }}">El cliente entregará el efectivo en oficina / punto autorizado.</td></tr>
        </table>
    @elseif($slug === 'qr')
        <h2 style="{{ $h2 }}">Depósito vía QR</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="{{ $th }}">Monto recibido</td><td style="{{ $td }}">{{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}</td></tr>
            @if($origin?->qr_value)
                <tr><td style="{{ $th }}">País QR origen</td><td style="{{ $td }}">{{ $origin->qr_country }}</td></tr>
                <tr><td style="{{ $th }}">QR origen</td><td style="{{ $td }}"><a href="{{ $origin->qr_value }}" target="_blank" style="color:#CA8A04;">Ver QR</a></td></tr>
            @endif
        </table>
    @else
        <h2 style="{{ $h2 }}">Depósito por transferencia bancaria</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="{{ $th }}">Monto recibido</td><td style="{{ $td }}">{{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}</td></tr>
            <tr><td style="{{ $th }}">Banco origen</td><td style="{{ $td }}">{{ $origin->bank->name ?? 'Banco N/D' }}</td></tr>
            <tr><td style="{{ $th }}">Cuenta origen</td><td style="{{ $td }}">{{ $origin->account_number ?? 'N/D' }}</td></tr>
        </table>
    @endif

    <h2 style="{{ $h2 }}">Cliente</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="{{ $th }}">Nombre</td><td style="{{ $td }}">{{ $data['transfer']->user->first_name }} {{ $data['transfer']->user->last_name }}</td></tr>
        <tr><td style="{{ $th }}">Email</td><td style="{{ $td }}">{{ $data['transfer']->user->email }}</td></tr>
        <tr><td style="{{ $th }}">Teléfono</td><td style="{{ $td }}">{{ $data['transfer']->user->phone ?? 'N/D' }}</td></tr>
        <tr><td style="{{ $th }}">Nacionalidad</td><td style="{{ $td }}">{{ ucfirst($data['transfer']->user->nationality ?? 'N/D') }}</td></tr>
        <tr><td style="{{ $th }}">Documento</td><td style="{{ $td }}">{{ $data['transfer']->user->document_number ?? 'N/D' }}</td></tr>
    </table>

    @if($slug === 'cash')
        <h2 style="{{ $h2 }}">Monto a entregar</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="{{ $th }}">Monto convertido</td><td style="{{ $td }}">{{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}</td></tr>
            <tr><td style="{{ $th }}">Retiro</td><td style="{{ $td }}">El cliente retirará el efectivo en oficina / punto autorizado.</td></tr>
        </table>
    @elseif($slug === 'qr')
        <h2 style="{{ $h2 }}">Monto a enviar (QR)</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="{{ $th }}">Monto convertido</td><td style="{{ $td }}">{{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}</td></tr>
            @if($dest?->qr_value)
                <tr><td style="{{ $th }}">País QR destino</td><td style="{{ $td }}">{{ $dest->qr_country }}</td></tr>
                <tr><td style="{{ $th }}">QR destino</td><td style="{{ $td }}"><a href="{{ $dest->qr_value }}" target="_blank" style="color:#CA8A04;">Ver QR</a></td></tr>
            @endif
        </table>
    @else
        <h2 style="{{ $h2 }}">Monto a enviar</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="{{ $th }}">Monto convertido</td><td style="{{ $td }}">{{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}</td></tr>
            <tr><td style="{{ $th }}">Banco destino</td><td style="{{ $td }}">{{ $dest->bank->name ?? 'Banco N/D' }}</td></tr>
            <tr><td style="{{ $th }}">Cuenta destino</td><td style="{{ $td }}">{{ $dest->account_number ?? 'N/D' }}</td></tr>
        </table>

        @if($destOwner)
            <h2 style="{{ $h2 }}">Titular de la cuenta destino</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr><td style="{{ $th }}">Nombre</td><td style="{{ $td }}">{{ $destOwner->full_name ?? 'N/D' }}</td></tr>
                <tr><td style="{{ $th }}">Documento</td><td style="{{ $td }}">{{ $destOwner->document_number ?? 'N/D' }}</td></tr>
                <tr><td style="{{ $th }}">Teléfono</td><td style="{{ $td }}">{{ $destOwner->phone ?? 'N/D' }}</td></tr>
                <tr><td style="{{ $th }}">Email</td><td style="{{ $td }}">{{ $destOwner->email ?? 'N/D' }}</td></tr>
            </table>
        @endif
    @endif

    <h2 style="{{ $h2 }}">Comprobante</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:4px 0 8px 0;">
        @if(!empty($data['comprobantePath']))
            @include('emails.partials.button', ['url' => $data['comprobantePath'], 'label' => 'Ver comprobante'])
        @else
            <span style="color:#6B7280; font-size:14px;">No se adjuntó comprobante.</span>
        @endif
    </td></tr></table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:18px 0 4px 0;">
        @include('emails.partials.button', ['url' => url('/admin/login'), 'label' => 'Ir al panel de administración', 'variant' => 'dark'])
    </td></tr></table>
@endsection
