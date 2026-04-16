<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nueva transferencia registrada</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:40px 0;">
        <tr>
            <td align="center">
                <!-- Contenedor principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding:30px 0;">
                            <img src="https://res.cloudinary.com/dnbklbswg/image/upload/v1772202747/logo_n6nqqr__2_-removebg-preview_qngiau.png" alt="{{ config('app.name') }}" style="width:150px; height:auto;">
                        </td>
                    </tr>

                    <!-- Encabezado -->
                    <tr>
                        <td style="padding:20px; text-align:center;">
                            <h1 style="color:#333333;">📌 Nueva transferencia registrada</h1>
                        </td>
                    </tr>

                    <!-- Detalles de la operación -->
                    <tr>
                        <td style="padding:0 30px 20px 30px; color:#555555; font-size:14px; line-height:1.6;">
                            @php
                                $slug       = $data['paymentMethodSlug'] ?? 'bank_transfer';
                                $methodName = $data['paymentMethodName'] ?? 'Transferencia Bancaria';
                                $origin     = $data['transfer']->originAccount ?? null;
                                $dest       = $data['transfer']->destinationAccount ?? null;
                                $destOwner  = $dest->owner ?? null;
                            @endphp

                            <h2 style="color:#333333;">📝 Detalles de la operación</h2>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Número de operación:</strong> {{ $data['transferNumber'] }}</li>
                                <li><strong>Fecha:</strong> {{ $data['transfer']->created_at->format('d/m/Y H:i') }}</li>
                                <li><strong>Método de pago:</strong> {{ $methodName }}</li>
                                <li><strong>Tipo de cambio aplicado:</strong> {{ $data['transfer']->exchange_rate }}</li>
                            </ul>

                            {{-- DEPÓSITO RECIBIDO --}}
                            @if($slug === 'cash')
                                <h2 style="color:#333333;">💵 Depósito en efectivo</h2>
                                <ul style="padding-left:20px; list-style-type:disc;">
                                    <li><strong>Monto a depositar:</strong> {{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}</li>
                                    <li>El cliente entregará el efectivo en oficina / punto autorizado.</li>
                                </ul>
                            @elseif($slug === 'qr')
                                <h2 style="color:#333333;">📱 Depósito vía QR</h2>
                                <ul style="padding-left:20px; list-style-type:disc;">
                                    <li><strong>Monto recibido:</strong> {{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}</li>
                                    @if($origin?->qr_value)
                                        <li><strong>País QR origen:</strong> {{ $origin->qr_country }}</li>
                                        <li><strong>URL QR origen:</strong> <a href="{{ $origin->qr_value }}" target="_blank">Ver QR</a></li>
                                    @endif
                                </ul>
                            @else
                                <h2 style="color:#333333;">🏦 Depósito por transferencia bancaria</h2>
                                <ul style="padding-left:20px; list-style-type:disc;">
                                    <li><strong>Monto recibido:</strong> {{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}</li>
                                    <li><strong>Banco origen:</strong> {{ $origin->bank->name ?? 'Banco N/D' }}</li>
                                    <li><strong>Número de cuenta origen:</strong> {{ $origin->account_number ?? 'N/D' }}</li>
                                </ul>
                            @endif

                            {{-- CLIENTE --}}
                            <h3 style="color:#333333;">👤 Cliente</h3>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Nombre:</strong> {{ $data['transfer']->user->first_name }} {{ $data['transfer']->user->last_name }}</li>
                                <li><strong>Email:</strong> {{ $data['transfer']->user->email }}</li>
                                <li><strong>Teléfono:</strong> {{ $data['transfer']->user->phone ?? 'N/D' }}</li>
                                <li><strong>Nacionalidad:</strong> {{ ucfirst($data['transfer']->user->nationality ?? 'N/D') }}</li>
                                <li><strong>Documento:</strong> {{ $data['transfer']->user->document_number ?? 'N/D' }}</li>
                            </ul>

                            {{-- MONTO A ENVIAR --}}
                            @if($slug === 'cash')
                                <h2 style="color:#333333;">📤 Monto a entregar</h2>
                                <ul style="padding-left:20px; list-style-type:disc;">
                                    <li><strong>Monto convertido:</strong> {{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}</li>
                                    <li>El cliente retirará el efectivo en oficina / punto autorizado.</li>
                                </ul>
                            @elseif($slug === 'qr')
                                <h2 style="color:#333333;">📤 Monto a enviar (QR)</h2>
                                <ul style="padding-left:20px; list-style-type:disc;">
                                    <li><strong>Monto convertido:</strong> {{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}</li>
                                    @if($dest?->qr_value)
                                        <li><strong>País QR destino:</strong> {{ $dest->qr_country }}</li>
                                        <li><strong>URL QR destino:</strong> <a href="{{ $dest->qr_value }}" target="_blank">Ver QR</a></li>
                                    @endif
                                </ul>
                            @else
                                <h2 style="color:#333333;">📤 Monto a enviar</h2>
                                <ul style="padding-left:20px; list-style-type:disc;">
                                    <li><strong>Monto convertido:</strong> {{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}</li>
                                    <li><strong>Banco destino:</strong> {{ $dest->bank->name ?? 'Banco N/D' }}</li>
                                    <li><strong>Número de cuenta destino:</strong> {{ $dest->account_number ?? 'N/D' }}</li>
                                </ul>

                                @if($destOwner)
                                    <h3 style="color:#333333;">👤 Titular de la cuenta destino</h3>
                                    <ul style="padding-left:20px; list-style-type:disc;">
                                        <li><strong>Nombre:</strong> {{ $destOwner->full_name ?? 'N/D' }}</li>
                                        <li><strong>Documento:</strong> {{ $destOwner->document_number ?? 'N/D' }}</li>
                                        <li><strong>Teléfono:</strong> {{ $destOwner->phone ?? 'N/D' }}</li>
                                        <li><strong>Email:</strong> {{ $destOwner->email ?? 'N/D' }}</li>
                                    </ul>
                                @endif
                            @endif

                            <h2 style="color:#333333;">📎 Comprobante</h2>
                            @if(!empty($data['comprobantePath']))
                                <p>
                                    <a href="{{ $data['comprobantePath'] }}" target="_blank"
                                    style="display:inline-block; padding:10px 18px; background-color:#1a73e8; color:#ffffff; text-decoration:none; border-radius:5px;">
                                        Ver comprobante
                                    </a>
                                </p>
                            @else
                                <p>No se adjuntó comprobante.</p>
                            @endif

                            <!-- Botón -->
                            <p style="text-align:center; margin:30px 0;">
                                <a href="{{ url('/admin/login') }}" style="display:inline-block; padding:12px 25px; background-color:#FF6600; color:#ffffff; text-decoration:none; border-radius:5px; font-weight:bold;">
                                    🔗 Ir al panel de administración
                                </a>
                            </p>

                            <p style="color:#555555; font-size:14px; line-height:1.5; margin-top:20px;">
                                Gracias,<br>
                                <strong>{{ config('app.name') }}</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color:#f0f0f0; color:#888888; font-size:12px; padding:15px;">
                            © {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
