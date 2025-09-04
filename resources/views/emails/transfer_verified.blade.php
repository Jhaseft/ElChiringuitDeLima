<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Transferencia realizada</title>
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
                            <img src="https://res.cloudinary.com/dnbklbswg/image/upload/v1756305635/logo_n6nqqr.jpg" 
                                 alt="{{ config('app.name') }}" style="width:150px; height:auto;">
                        </td>
                    </tr>

                    <!-- Encabezado -->
                    <tr>
                        <td style="padding:20px; text-align:center;">
                            <h1 style="color:#10b981;">✅ Tu transferencia ha sido realizada</h1>
                        </td>
                    </tr>

                    <!-- Detalles de la operación -->
                    <tr>
                        <td style="padding:0 30px 20px 30px; color:#555555; font-size:14px; line-height:1.6;">
                            <h2 style="color:#333333;">📝 Detalles de la transferencia</h2>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Monto enviado:</strong> {{ $amount }}</li>
                                <li><strong>Monto convertido:</strong> {{ $converted_amount ?? '-' }}</li>
                                <li><strong>Tipo de cambio:</strong> {{ $exchange_rate ?? '-' }}</li>
                                <li><strong>Modo de transferencia:</strong> {{ $transfer->modo ?? '-' }}</li>
                            </ul>

                            <h2 style="color:#333333;">🏦 Cuentas involucradas</h2>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                @if($origin_account || $destination_account)
                                    <li><strong>Cuenta origen:</strong> {{ $origin_account?->account_number ?? 'N/A' }}</li>
                                    <li><strong>Cuenta destino:</strong> {{ $destination_account?->account_number ?? 'N/A' }}</li>
                                @else
                                    <li>Información de cuentas no disponible.</li>
                                @endif
                            </ul>

                            @if($comprobante)
                                <h2 style="color:#333333;">📎 Comprobante</h2>
                                <p>Se adjunta el comprobante de la transferencia.</p>
                            @endif


                            <p style="color:#555555; font-size:14px; line-height:1.5; margin-top:20px;">
                                Gracias por usar nuestro servicio,<br>
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
