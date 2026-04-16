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
                            <img src="https://res.cloudinary.com/dnbklbswg/image/upload/v1772202747/logo_n6nqqr__2_-removebg-preview_qngiau.png" 
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
                            @php
                                $slug       = $paymentMethodSlug ?? 'bank_transfer';
                                $methodName = $paymentMethodName ?? 'Transferencia Bancaria';
                                $depCur     = $depositCurrency ?? '';
                                $recCur     = $receiveCurrency ?? '';
                            @endphp

                            <h2 style="color:#333333;">📝 Detalles de la transferencia</h2>
                            <ul style="padding-left:20px; list-style-type:disc;">
                                <li><strong>Método de pago:</strong> {{ $methodName }}</li>
                                <li><strong>Monto enviado:</strong> {{ number_format($amount, 2) }} {{ $depCur }}</li>
                                <li><strong>Monto convertido:</strong> {{ number_format($converted_amount ?? 0, 2) }} {{ $recCur }}</li>
                                <li><strong>Tipo de cambio:</strong> {{ $exchange_rate ?? '-' }}</li>
                                <li><strong>Modo de transferencia:</strong> {{ $transfer->modo ?? '-' }}</li>
                            </ul>

                            {{-- Cuentas involucradas según método --}}
                            @if($slug === 'cash')
                                <h2 style="color:#333333;">💵 Entrega en efectivo</h2>
                                <p>Su operación con pago en efectivo ha sido completada. Si aún no ha retirado el monto convertido, acérquese a la oficina / punto autorizado con su documento de identidad.</p>
                            @elseif($slug === 'qr')
                                <h2 style="color:#333333;">📱 Operación vía QR</h2>
                                <ul style="padding-left:20px; list-style-type:disc;">
                                    @if($origin_account?->qr_value)
                                        <li><strong>QR origen:</strong> país {{ $origin_account->qr_country }}</li>
                                    @endif
                                    @if($destination_account?->qr_value)
                                        <li><strong>QR destino:</strong> país {{ $destination_account->qr_country }}</li>
                                    @endif
                                </ul>
                            @else
                                <h2 style="color:#333333;">🏦 Cuentas involucradas</h2>
                                <ul style="padding-left:20px; list-style-type:disc;">
                                    @if($origin_account || $destination_account)
                                        <li><strong>Cuenta origen:</strong>
                                            {{ $origin_account?->bank?->name ? $origin_account->bank->name.' — ' : '' }}
                                            {{ $origin_account?->account_number ?? 'N/A' }}
                                        </li>
                                        <li><strong>Cuenta destino:</strong>
                                            {{ $destination_account?->bank?->name ? $destination_account->bank->name.' — ' : '' }}
                                            {{ $destination_account?->account_number ?? 'N/A' }}
                                        </li>
                                    @else
                                        <li>Información de cuentas no disponible.</li>
                                    @endif
                                </ul>
                            @endif

                            @if(!empty($adminReceipt))
                                <h2 style="color:#333333;">📎 Comprobante aprobado</h2>
                                <p>Puedes visualizar tu comprobante oficial haciendo clic en el siguiente botón:</p>

                                <div style="margin:20px 0; text-align:center;">
                                    <a href="{{ $adminReceipt }}"
                                    target="_blank"
                                    style="background-color:#10b981;
                                            color:#ffffff;
                                            padding:12px 25px;
                                            text-decoration:none;
                                            border-radius:6px;
                                            font-weight:bold;
                                            display:inline-block;">
                                        Ver comprobante
                                    </a>
                                </div>
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
