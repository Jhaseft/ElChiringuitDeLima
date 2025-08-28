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
                            <img src="https://res.cloudinary.com/dnbklbswg/image/upload/v1756305635/logo_n6nqqr.jpg" alt="{{ config('app.name') }}" style="width:150px; height:auto;">
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
                            <h2 style="color:#333333;">📝 Detalles de la operación</h2>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Número de operación:</strong> {{ $data['transferNumber'] }}</li>
                                <li><strong>Fecha:</strong> {{ $data['transfer']->created_at->format('d/m/Y H:i') }}</li>
                                <li><strong>Tipo de cambio aplicado:</strong> {{ $data['transfer']->exchange_rate }}</li>
                            </ul>

                            <h2 style="color:#333333;">💰 Depósito recibido</h2>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Monto recibido:</strong> {{ number_format($data['transfer']->amount, 2) }} {{ $data['depositCurrency'] }}</li>
                                <li><strong>Banco origen:</strong> {{ $data['transfer']->originAccount->bank->name ?? 'Banco N/D' }}</li>
                                <li><strong>Número de cuenta origen:</strong> {{ $data['transfer']->origin_account_number }}</li>
                            </ul>

                            <h3 style="color:#333333;">👤 Propietario de la cuenta origen</h3>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Nombre:</strong> {{ $data['transfer']->user->first_name }} {{ $data['transfer']->user->last_name }}</li>
                                <li><strong>Email:</strong> {{ $data['transfer']->user->email }}</li>
                                <li><strong>Teléfono:</strong> {{ $data['transfer']->user->phone ?? 'N/D' }}</li>
                                <li><strong>Nacionalidad:</strong> {{ ucfirst($data['transfer']->user->nationality ?? 'N/D') }}</li>
                                <li><strong>Documento:</strong> {{ $data['transfer']->user->document_number ?? 'N/D' }}</li>
                            </ul>

                            <h2 style="color:#333333;">📤 Monto a enviar</h2>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Monto convertido:</strong> {{ number_format($data['convertedAmount'], 2) }} {{ $data['receiveCurrency'] }}</li>
                                <li><strong>Banco destino:</strong> {{ $data['transfer']->destinationAccount->bank->name ?? 'Banco N/D' }}</li>
                                <li><strong>Número de cuenta destino:</strong> {{ $data['transfer']->destination_account_number }}</li>
                            </ul>

                            @php
                                $destOwner = $data['transfer']->destinationAccount->owner ?? null;
                            @endphp

                            @if($destOwner)
                            <h3 style="color:#333333;">👤 Titular de la cuenta destino</h3>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Nombre:</strong> {{ $destOwner->full_name ?? 'N/D' }}</li>
                                <li><strong>Documento:</strong> {{ $destOwner->document_number ?? 'N/D' }}</li>
                                <li><strong>Teléfono:</strong> {{ $destOwner->phone ?? 'N/D' }}</li>
                                <li><strong>Email:</strong> {{ $destOwner->email ?? 'N/D' }}</li>
                            </ul>
                            @endif

                            <h2 style="color:#333333;">📎 Comprobante</h2>
                            <p>Verificar con el comprobante adjunto.</p>

                            <!-- Botón -->
                            <p style="text-align:center; margin:30px 0;">
                                <a href="{{ url('/admin/transfers') }}" style="display:inline-block; padding:12px 25px; background-color:#FF6600; color:#ffffff; text-decoration:none; border-radius:5px; font-weight:bold;">
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
