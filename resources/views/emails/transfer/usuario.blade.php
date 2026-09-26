@extends('emails.layout', ['title' => 'Operación registrada'])

@section('content')
    @php
        $slug       = $data['paymentMethodSlug'] ?? 'bank_transfer';
        $methodName = $data['paymentMethodName'] ?? 'Transferencia Bancaria';
        $th         = 'text-align:left; padding:10px 12px; background-color:#F9FAFB; border:1px solid #E5E7EB; color:#374151; font-weight:700; font-size:13px; width:45%;';
        $td         = 'padding:10px 12px; border:1px solid #E5E7EB; color:#111827; font-size:13px;';
        $h2         = 'margin:26px 0 12px 0; color:#111827; font-size:16px; font-weight:700;';
    @endphp

    <h1 style="margin:8px 0 12px 0; color:#111827; font-size:24px; font-weight:800; line-height:1.3;">
        Operación registrada
    </h1>

    <p style="margin:0 0 6px 0; color:#374151; font-size:15px; line-height:1.6;">
        Tu operación fue registrada correctamente con el número
        <strong style="color:#111827;">{{ $data['transferNumber'] }}</strong>.
    </p>

    <h2 style="{{ $h2 }}">Resumen de la operación</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="{{ $th }}">Método de pago</td><td style="{{ $td }}">{{ $methodName }}</td></tr>
        <tr><td style="{{ $th }}">Monto registrado</td><td style="{{ $td }}">{{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}</td></tr>
        <tr><td style="{{ $th }}">Recibirás</td><td style="{{ $td }}">{{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}</td></tr>
        <tr><td style="{{ $th }}">Tipo de cambio</td><td style="{{ $td }}">{{ $data['transfer']->exchange_rate }}</td></tr>
        <tr><td style="{{ $th }}">Fecha de operación</td><td style="{{ $td }}">{{ $data['transfer']->created_at->format('d/m/Y H:i') }}</td></tr>
    </table>

    @if($slug === 'cash')
        <h2 style="{{ $h2 }}">Pago en efectivo</h2>
        <p style="margin:0; color:#374151; font-size:14px; line-height:1.6;">Acércate a nuestra oficina o punto autorizado para completar el depósito en efectivo. Un asesor coordinará la entrega y validación del monto.</p>
    @elseif($slug === 'qr')
        <h2 style="{{ $h2 }}">Pago vía QR</h2>
        <p style="margin:0; color:#374151; font-size:14px; line-height:1.6;">Realiza el pago escaneando el QR proporcionado. Una vez confirmado el depósito, procesaremos el envío correspondiente.</p>
    @else
        <h2 style="{{ $h2 }}">Transferencia bancaria</h2>
        <p style="margin:0; color:#374151; font-size:14px; line-height:1.6;">Realiza la transferencia a la cuenta bancaria indicada. Una vez acreditado el depósito, procesaremos el envío.</p>
    @endif

    <div style="margin:24px 0; padding:14px 16px; background-color:#FEF9C3; border:1px solid #EAB308; border-radius:12px;">
        <p style="margin:0 0 6px 0; color:#854D0E; font-size:14px; font-weight:700;">Nota importante</p>
        <p style="margin:0; color:#854D0E; font-size:13px; line-height:1.6;">Las operaciones realizadas fuera de horario serán atendidas al siguiente día hábil.</p>
    </div>

    <h2 style="{{ $h2 }}">Horarios de atención</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="{{ $th }}">Lunes a Sábado</td><td style="{{ $td }}">08:00 AM - 5:00 PM</td></tr>
        <tr><td style="{{ $th }}">Domingos</td><td style="{{ $td }}">Solo por transferencia o QR (no efectivo)</td></tr>
    </table>

    <p style="margin:26px 0 0 0; color:#374151; font-size:14px; line-height:1.6;">
        En breve recibirás un nuevo correo con el comprobante de depósito correspondiente.
    </p>
    <p style="margin:14px 0 0 0; color:#374151; font-size:14px; line-height:1.6;">
        Atentamente,<br>
        <strong style="color:#111827;">Equipo de Atención al Cliente · {{ config('app.name') }}</strong>
    </p>
@endsection
